import { ApiError, ApiResponse, asyncHandler } from "../utils/utils.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Liked } from "../models/videoLike.model.js";
import { Comment } from "../models/comment.model.js";
import { WatchLater } from "../models/watchLater.model.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../utils/uploadoncloudinary.js";
import { pipeline } from "stream";

// Upload video
const uploadVideo = asyncHandler(async (req, res) => {
  try {
    const {
      title,
      description,
      visibility = "public",
      isDraft = false,
      videoUrl,
    } = req.body;

    if (!title?.trim() || !description?.trim()) {
      throw new ApiError(400, "Title and description are required");
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoLocalPath && !videoUrl) {
      throw new ApiError(
        400,
        "Video file (upload) ya videoUrl (link) required"
      );
    }

    let videoFileURL = "";
    let videoDuration = 0;

    if (videoLocalPath) {
      const videoFile = await uploadOnCloudinary(videoLocalPath);
      if (!videoFile) throw new ApiError(400, "Failed to upload video");
      videoFileURL = videoFile.url;
      videoDuration = videoFile.duration || 0;
    } else if (videoUrl) {
      videoFileURL = videoUrl.trim();
    }

    let thumbnailURL = "";
    if (thumbnailLocalPath) {
      const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
      thumbnailURL = thumbnail?.url || "";
    }
    
    if (!thumbnailURL && videoFileURL?.includes("cloudinary")) {
      const urlParts = videoFileURL.split("/upload/");
      if (urlParts.length === 2) {
        const publicId = urlParts[1].split(".")[0];
        thumbnailURL = `https://res.cloudinary.com/${process.env.CLOUD_NAME}/video/upload/so_0,w_320,h_180,c_fill,q_auto/${publicId}.jpg`;
      }
    }

    const video = await Video.create({
      title,
      description,
      videoFile: videoFileURL,
      thumbnail: thumbnailURL,
      duration: videoDuration,
      owner: req.user?._id || new mongoose.Types.ObjectId(),
      visibility,
      isDraft: isDraft === "true" || isDraft === true,
      isPublished: !isDraft,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, video, "Video uploaded successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to upload video");
  }
});

// Get all videos
const getAllVideos = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, query } = req.query;

    const pipeline = [];

    if (query) {
  pipeline.push({
    $match: {
      $or: [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
      ],
    },
  });
}

    const { drafts = "false" } = req.query;
    const isDraftOnly = drafts === "true";

    pipeline.push({
      $match: isDraftOnly
        ? { isDraft: true }
        : {
            $and: [
              {
                $or: [
                  { isPublished: true },
                  { isPublished: { $exists: false } },
                ],
              },
              { $or: [{ isDraft: false }, { isDraft: { $exists: false } }] },
              { visibility: "public" },
            ],
          },
    });

    pipeline.push({
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [{ $project: { username: 1, fullName: 1, avatar: 1 } }],
      },
    });
    pipeline.push({ $addFields: { owner: { $first: "$owner" } } });
    pipeline.push({
      $project: {
        _id: 1,
        title: 1,
        description: 1,
        thumbnail: 1,
        videoFile: 1,
        duration: 1,
        views: 1,
        likes: 1,
        owner: 1,
        createdAt: 1,
      },
    });
    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $skip: (parseInt(page) - 1) * parseInt(limit) });
    pipeline.push({ $limit: parseInt(limit) });

    const videos = await Video.aggregate(pipeline);

    return res
      .status(200)
      .json(new ApiResponse(200, videos, "Videos fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to fetch videos");
  }
});

// controller me
export const getSearchSuggestions = asyncHandler(async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json({ suggestions: [] });

  const regex = new RegExp(q, "i");

  const videos = await Video.find(
    {
      $or: [{ title: regex }, { description: regex }],
      isPublished: true,
      visibility: "public",
    },
    { title: 1 } // sirf title
  )
    .sort({ views: -1 })
    .limit(5);

  const suggestions = videos.map((v) => v.title);

  res.json({ suggestions });
});


// Get video by ID
const getVideoById = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(videoId),
          isPublished: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [{ $project: { username: 1, fullName: 1, avatar: 1 } }],
        },
      },
      { $addFields: { owner: { $first: "$owner" } } },
    ]);

    if (!video?.length) {
      throw new ApiError(404, "Video not found");
    }

    await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } });

    return res
      .status(200)
      .json(new ApiResponse(200, video[0], "Video fetched successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to fetch video");
  }
});

// Toggle like video
const toggleVideoLike = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    const existingLike = await Liked.findOne({
      video: videoId,
      likedBy: req.user._id,
    });

    if (existingLike) {
      await Liked.findByIdAndDelete(existingLike._id);
      await Video.findByIdAndUpdate(videoId, { $inc: { likes: -1 } });
      return res
        .status(200)
        .json(
          new ApiResponse(200, { isLiked: false }, "Video unliked successfully")
        );
    } else {
      await Liked.create({
        video: videoId,
        likedBy: req.user._id,
        Id: req.user._id,
      });
      await Video.findByIdAndUpdate(videoId, { $inc: { likes: 1 } });
      return res
        .status(200)
        .json(
          new ApiResponse(200, { isLiked: true }, "Video liked successfully")
        );
    }
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to toggle like");
  }
});

// Add to watch later
const addToWatchLater = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
      throw new ApiError(400, "Invalid video ID");
    }

    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    const existingWatchLater = await WatchLater.findOne({
      videoId: videoId,
      Owner: req.user._id,
    });

    if (existingWatchLater) {
      throw new ApiError(400, "Video already in watch later");
    }

    await WatchLater.create({
      Id: req.user._id,
      videoId: videoId,
      Owner: req.user._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Video added to watch later"));
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to add to watch later");
  }
});

// Get trending videos
const getTrendingVideos = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pipeline = [
      { $match: { isPublished: true, visibility: "public" } },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
          pipeline: [{ $project: { username: 1, fullName: 1, avatar: 1 } }],
        },
      },
      {
        $addFields: {
          owner: { $first: "$owner" },
          trendingScore: {
            $add: [
              { $multiply: ["$views", 0.7] },
              { $multiply: ["$likes", 0.3] },
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          thumbnail: 1,
          videoFile: 1,
          duration: 1,
          views: 1,
          likes: 1,
          owner: 1,
          createdAt: 1,
          trendingScore: 1,
        },
      },
      { $sort: { trendingScore: -1, createdAt: -1 } },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
    ];

    const videos = await Video.aggregate(pipeline);

    return res
      .status(200)
      .json(
        new ApiResponse(200, videos, "Trending videos fetched successfully")
      );
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to fetch trending videos");
  }
});

// Get update Video 
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const updateData = req.body;
  const video = await Video.findByIdAndUpdate(videoId, updateData, {
    new: true,
  });
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  res.status(200).json(new ApiResponse(200, video, "Video updated"));
});

//Get recommended Videos 
const getRecommendedVideos = asyncHandler(async(req , res) => {
  try {
    const { videoId } = req.params;
    const { limit = 10 } = req.query;

    if(!mongoose.isValidObjectId(videoId)){
      throw new ApiError(400,"InValid Video Id")
    }

    const recommendations = await Video.aggregate([
      {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(videoId)},
          isPublished: true,
          visibility:"public"
        },   
      },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as:"owner",
          pipeline: [{ $project: { username: 1, fullName:1 , avatar:1,verified:1}}],
        },
      },
      {
        $addFields: {
          owner: { $first: "$owner" }
        }
      },
      {
        $sort: {
          views: -1,
          createdAt: -1
        }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project:{
          id: "$_id",
          _id:1,
          title:1,
          description:1,
          thumbnail:1,
          videoFile:1,
          duration:1,
          views:1,
          createdAt:1,
          channel: "$owner.fullName",
          channelAvatar: { $substr: ["$owner.fullName", 0, 1] },
          verified: "$owner.verified",
        },
      },
    ]);

    const formattedRecommendations = recommendations.map(video => {
      let thumbnail = video.thumbnail;
      if (!thumbnail && video.videoFile?.includes("cloudinary")) {
        const urlParts = video.videoFile.split("/upload/");
        if (urlParts.length === 2) {
          const publicId = urlParts[1].split(".")[0];
          thumbnail = `https://res.cloudinary.com/${process.env.CLOUD_NAME}/video/upload/so_0,w_320,h_180,c_fill,q_auto/${publicId}.jpg`;
        }
      }
      return {
        ...video,
        id: video._id,
        thumbnail,
        uploadedAt: new Date(video.createdAt).toLocaleDateString(),
        views: `${video.views}`,
      };
    });

    return res
    .status(200)
    .json(
      new ApiResponse(200,{ videos : formattedRecommendations }, "Recommended videos fetched successfully")
    );
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to fetch recommended videos");
  }
});

export {
  uploadVideo,
  getAllVideos,
  getVideoById,
  toggleVideoLike,
  addToWatchLater,
  getTrendingVideos,
  updateVideo,
  getRecommendedVideos,
};
