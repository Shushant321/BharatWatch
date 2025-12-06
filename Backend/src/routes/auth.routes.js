import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  zohoAuth, 
  verifyEmail, 
} from "../controllers/auth.controller.js";
import { refreshAccessToken } from "../controllers/token.controller.js";
import { googleAuth } from "../controllers/google.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", authMiddleware, logoutUser);

// NEW
router.post("/google", googleAuth);
router.post("/zoho/callback", zohoAuth);
router.post("/verify-email", verifyEmail);

export default router;
