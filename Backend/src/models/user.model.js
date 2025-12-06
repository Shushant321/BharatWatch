import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      default: "",
      sparse: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    isEmailverified: {
      type: Boolean,
      default: false,
    },
    emailVerificationCode: {
      type: String, // 7-digit code string
    },
    emailVerificationCodeExpires: {
      type: Date,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default:""
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    avatar: {
      type: String, //cloudinary url
    },
    Banner: {
      type: String, //cloudinary url
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save",async function (next) {
    if(!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullName: this.fullName
        }, 
        process.env.ACCESS_TOKEN_SECRET,
        {
           expiresIn: process.env.ACCESS_TOKEN_EXPIRY 
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        }, 
        process.env.REFRESH_TOKEN_SECRET,
        {
           expiresIn: process.env.REFRESH_TOKEN_EXPIRY 
        }
    )
}

export const User = mongoose.model("User",userSchema)