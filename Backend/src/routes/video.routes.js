import { Router } from "express";
import {
  uploadVideo,
  getAllVideos,
  getVideoById,
  toggleVideoLike,
  addToWatchLater,
  getTrendingVideos,
  updateVideo,
  getRecommendedVideos,
  getSearchSuggestions,
  // searchVideos,
} from "../controllers/video.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { validateVideoUpload } from "../middlewares/validation.middleware.js";
import { uploadLimiter, apiLimiter } from "../middlewares/security.middleware.js";
import { addComment, getComments, likeComment, replyToComment, getReplies, likeReply } from "../controllers/comment.controller.js";

const router = Router();

router.get("/search/suggestions", getSearchSuggestions);

// Video upload
router.route("/upload").post(
    uploadLimiter,
    upload.fields([
        { name: "videoFile", maxCount: 1 },
        { name: "thumbnail", maxCount: 1 }
    ]),
    validateVideoUpload,
    uploadVideo
);

// Trending videos
router.route("/trending").get(apiLimiter, getTrendingVideos);

// Drafts route
router.route("/drafts").get(authMiddleware, getAllVideos);

// Video comments (MUST be before /:videoId)
router.post("/:videoId/comments", addComment);
router.get("/:videoId/comments", getComments);
router.post("/:videoId/comments/:commentId/like", likeComment);
router.post("/:videoId/comments/:commentId/reply", replyToComment);
router.get("/:videoId/comments/:commentId/replies", getReplies);
router.post("/:videoId/comments/:commentId/replies/:replyId/like", likeReply);

//Recommendations 
router.get("/:videoId/recommendations",apiLimiter,getRecommendedVideos);

// Video likes and watch later
router.post("/:videoId/like", authMiddleware, toggleVideoLike);
router.post("/:videoId/watchlater", authMiddleware, addToWatchLater);

// Generic video routes (MUST be last)
router.get("/", apiLimiter, getAllVideos);
router.get("/:videoId", apiLimiter, getVideoById);
router.patch("/:videoId", updateVideo);

// router.get("/search", searchVideos);



export default router;