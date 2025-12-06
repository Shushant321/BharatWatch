import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../../api.js";
import "./Auth.css";
import { useGoogleLogin } from "@react-oauth/google";


const ZOHO_CLIENT_ID = import.meta.env.VITE_ZOHO_CLIENT_ID;
const ZOHO_REDIRECT_URI = import.meta.env.VITE_ZOHO_REDIRECT_URI;
const ZOHO_ACCOUNTS_URL =
  import.meta.env.VITE_ZOHO_ACCOUNTS_URL || "https://accounts.zoho.in";

// Zoho profile read scope
const ZOHO_SCOPE = encodeURIComponent("AaaServer.profile.Read");


const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmpassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const err = {};
    if (!formData.fullName.trim()) err.fullName = "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(formData.email))
      err.email = "Enter a valid email";
    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/.test(
        formData.password
      )
    ) {
      err.password =
        "Password must be at least 8 characters with uppercase, lowercase, and number";
    }
    if (formData.password !== formData.confirmpassword)
      err.confirmpassword = "Passwords do not match";
    return err;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  const validation = validate();
  if (Object.keys(validation).length) {
    setErrors(validation);
    return;
  }

  setLoading(true);
  try {
    const result = await api.register({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      confirmpassword: formData.confirmpassword,
    });

    if (result.success) {
      // pehle /home jaa rahe the, ab verify page pe
      navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } else {
      setErrors({ server: result.message || "Signup failed" });
    }
  } catch (error) {
    setErrors({
      server: error.message || "Signup failed. Please try again.",
    });
  } finally {
    setLoading(false);
  }
};

  //google login
  const googleLogin = useGoogleLogin({
    flow: "implicit",
    scope: "openid email profile",
    onSuccess: async (tokenResponse) => {
      try {
        // Google se user profile lao
        const res = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );
        const profile = await res.json(); // { email, name, picture, sub }[web:580]

        const result = await api.googleLogin({
          email: profile.email,
          fullName: profile.name,
          avatar: profile.picture,
          googleId: profile.sub,
        });

        if (result.success) {
          navigate("/home");
        } else {
          setError(result.message || "Google login failed");
        }
      } catch (err) {
        setError("Google login failed. Please try again.");
      }
    },
    onError: () => {
      setError("Google login failed");
    },
  });
  const zohoLogin = () => {
    const authUrl =
      `${ZOHO_ACCOUNTS_URL}/oauth/v2/auth?` +
      `response_type=code&` +
      `client_id=${ZOHO_CLIENT_ID}&` +
      `scope=${ZOHO_SCOPE}&` +
      `redirect_uri=${encodeURIComponent(ZOHO_REDIRECT_URI)}`;

    window.location.href = authUrl; // Zoho login page par redirect[web:667][web:696]
  };


  return (
    <>
      {/* <Navbar /> */}
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>BharatWatch</h1>
            <h2>Create Account</h2>
          </div>

          {errors.server && (
            <div className="error-message">{errors.server}</div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleInputChange}
                aria-label="Full Name"
              />
              {errors.fullName && (
                <span className="error-text">{errors.fullName}</span>
              )}
            </div>

            <div className="input-group">
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleInputChange}
                required
                aria-label="Email Address"
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            <div className="input-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                aria-label="Password"
              />
              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
            </div>

            <div className="input-group">
              <input
                type="password"
                name="confirmpassword"
                placeholder="Confirm Password"
                value={formData.confirmpassword}
                onChange={handleInputChange}
                required
                aria-label="Confirm Password"
              />
              {errors.confirmpassword && (
                <span className="error-text">
                  {errors.confirmpassword}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="auth-btn primary"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <div className="social-auth">
            <button
  className="auth-btn google"
  type="button"
  onClick={() => googleLogin()}
>
               <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button
              className="auth-btn zoho"
              type="button"
              onClick={zohoLogin}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1976D2" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Continue with Zoho
            </button>
          </div>

          <div className="auth-footer">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="link-btn">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
