import { User } from "../models/user.model.js";
import axios from "axios";   
import { sendEmail } from "../utils/sendEmail.js";
import { getAccessAndRefreshTokens } from "../utils/generateTokens.js";

const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const generateEmailCode = () => {
  // 7 digit code (1000000 - 9999999)
  return Math.floor(1000000 + Math.random() * 9000000).toString();
};


//ZOHO AUTH CONTROLLER
export const zohoAuth = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Authorization code missing" });
    }

    // Step 1: code -> access token
    const tokenRes = await axios.post(
      `${process.env.ZOHO_ACCOUNTS_URL}/oauth/v2/token`,
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.ZOHO_CLIENT_ID,
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        redirect_uri: process.env.ZOHO_REDIRECT_URI,
        code,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = tokenRes.data.access_token;

    // Step 2: Zoho se current user info (email, name) lao
    const meRes = await axios.get(
      "https://accounts.zoho.in/oauth/user/info",
      {
        headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
      }
    );

    const zohoUser = meRes.data;
    const email = zohoUser.Email;
    const fullName = zohoUser.Display_Name || zohoUser.first_name;

    if (!email) {
      return res
        .status(400)
        .json({ message: "Could not get email from Zoho account" });
    }

    // Step 3: apne DB me user find/create
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        fullName,
        username: email.split("@")[0],
        password: Math.random().toString(36).slice(-12),
        isEmailverified: true,
      });
    }

    // Step 4: Google jaisa JWT + refresh token generate
    const { accessToken: jwtAccess, refreshToken } =
      await getAccessAndRefreshTokens(user);

    const isProd = process.env.NODE_ENV === "production";

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        user,
        accessToken: jwtAccess,
      });
  } catch (err) {
    next(err);
  }
};


// SIGNUP
export const registerUser = async (req, res, next) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    // validations same as pehle
    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Email already registered" });
    }

    const username = email.split("@")[0];

    const code = generateEmailCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    const user = await User.create({
      fullName,
      email,
      password,
      username,
      isEmailverified: false,
      emailVerificationCode: code,
      emailVerificationCodeExpires: expires,
    });

    // yahan mail bhejo
    await sendEmail(
      email,
      "Verify your BharatWatch account",
      `Hi ${fullName || username},

Your BharatWatch verification code is: ${code}

This code will expire in 15 minutes.

If you did not sign up, please ignore this email.`
    );

    // yahan pe chahe to login mat karao, sirf message:
    return res.status(201).json({
      message: "User created. Please verify your email with the code sent.",
    });

    // agar tujhe turant accessToken bhi dena hai to upar ki return hata ke
    // pehle jaisa token generate kar sakta hai, lekin usually verification se pehle login nahi karwate.
  } catch (err) {
    next(err);
  }
};


export const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res
        .status(400)
        .json({ message: "Email and code are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.isEmailverified) {
      return res
        .status(200)
        .json({ message: "Email already verified" });
    }

    if (
      !user.emailVerificationCode ||
      user.emailVerificationCode !== code
    ) {
      return res.status(400).json({ message: "Invalid verification code" });
    }

    if (
      !user.emailVerificationCodeExpires ||
      user.emailVerificationCodeExpires < new Date()
    ) {
      return res.status(400).json({ message: "Verification code expired" });
    }

    user.isEmailverified = true;
    user.emailVerificationCode = null;
    user.emailVerificationCodeExpires = null;

    await user.save();

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (err) {
    next(err);
  }
};


// LOGIN
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(401)
        .json({ message: "Invalid email or password" });

    const ok = await user.isPasswordCorrect(password);
    if (!ok)
      return res
        .status(401)
        .json({ message: "Invalid email or password" });

    const { accessToken, refreshToken } =
      await getAccessAndRefreshTokens(user);

    const isProd = process.env.NODE_ENV === "production";

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
          isEmailverified: user.isEmailverified,
        },
        accessToken,
      });
  } catch (err) {
    next(err);
  }
};

// LOGOUT
export const logoutUser = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (userId) {
      await User.findByIdAndUpdate(
        userId,
        { $unset: { refreshToken: 1 } },
        { new: true }
      );
    }

    const isProd = process.env.NODE_ENV === "production";

    res
      .clearCookie("refreshToken", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
      })
      .json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
};
