import { WatchHistory } from "../models/watchHistory.model.js";
import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const addToWatchHistory = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  await WatchHistory.findOneAndUpdate(
    { user: userId, video: videoId },
    { watchedAt: new Date() },
    { upsert: true, new: true }
  );

  res.status(200).json(new ApiResponse(200, {}, "Added to watch history"));
});

const getWatchHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 20 } = req.query;

  const history = await WatchHistory.find({ user: userId })
    .populate("video", "title thumbnail views owner")
    .sort({ watchedAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await WatchHistory.countDocuments({ user: userId });

  res.status(200).json(
    new ApiResponse(200, { data: history, total }, "Watch history fetched")
  );
});

const removeFromWatchHistory = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  await WatchHistory.findOneAndDelete({ user: userId, video: videoId });

  res.status(200).json(new ApiResponse(200, {}, "Removed from watch history"));
});

const clearWatchHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await WatchHistory.deleteMany({ user: userId });

  res.status(200).json(new ApiResponse(200, {}, "Watch history cleared"));
});

export {
  addToWatchHistory,
  getWatchHistory,
  removeFromWatchHistory,
  clearWatchHistory,
};
