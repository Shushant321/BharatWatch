import { Router } from "express";
import {
  addToWatchHistory,
  getWatchHistory,
  removeFromWatchHistory,
  clearWatchHistory,
} from "../controllers/watchHistory.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getWatchHistory);
router.post("/:videoId", addToWatchHistory);
router.delete("/:videoId", removeFromWatchHistory);
router.delete("/", clearWatchHistory);

export default router;
