import { Comment } from "../models/comment.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { commentLike } from "../models/comment_like.model.js";
import { replyLike } from "../models/reply_like.model.js";
import { CommentReply } from "../models/comment_reply.model.js";
import { createNotification } from "./notification.controller.js";

export const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { text, userId } = req.body;

  if (!text?.trim()) {
    throw new ApiError(400, "Comment text is required");
  }

  const testUserId = userId || new mongoose.Types.ObjectId();

  const comment = await Comment.create({
    content: text,
    video: videoId,
    owner: testUserId,
  });

  await Video.findByIdAndUpdate(videoId, { $inc: { commentsCount: 1 } });

  const video = await Video.findById(videoId);
  const commenter = await User.findById(testUserId);
  await createNotification(
    video.owner,
    `${commenter?.fullName || "Someone"} commented on your video`,
    `"${video.title}" has a new comment`,
    "comment"
  );

  const populatedComment = await comment.populate("owner", "fullName");

  const transformed = {
    id: populatedComment._id,
    user: populatedComment.owner?.fullName || "Anonymous",
    avatar: populatedComment.owner?.fullName?.charAt(0) || "A",
    time: new Date(populatedComment.createdAt).toLocaleDateString(),
    text: populatedComment.content,
    likes: 0,
    replies: 0,
  };

  res.status(201).json(new ApiResponse(201, transformed, "Comment added successfully"));
});

export const getComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const comments = await Comment.find({ video: videoId })
    .populate("owner", "fullName")
    .sort({ createdAt: -1 });

  const transformedComments = comments.map((comment) => ({
    id: comment._id,
    user: comment.owner?.fullName || "Anonymous",
    avatar: comment.owner?.fullName?.charAt(0) || "A",
    time: new Date(comment.createdAt).toLocaleDateString(),
    text: comment.content,
    likes: comment.likes || 0,
    replies: comment.replies?.length || 0,
  }));

  res.status(200).json(new ApiResponse(200, transformedComments, "Comments fetched successfully"));
});

export const likeComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { userId } = req.body;

  const testUserId = userId || new mongoose.Types.ObjectId();

  const existingLike = await commentLike.findOne({
    comment: commentId,
    likedBy: testUserId,
  });

  let updatedComment;
  if (existingLike) {
    await commentLike.deleteOne({ _id: existingLike._id });
    updatedComment = await Comment.findByIdAndUpdate(commentId, { $inc: { likes: -1 } }, { new: true });
    return res.status(200).json(new ApiResponse(200, { liked: false, likes: updatedComment.likes }, "Like removed"));
  }

  await commentLike.create({
    comment: commentId,
    likedBy: testUserId,
  });

  updatedComment = await Comment.findByIdAndUpdate(commentId, { $inc: { likes: 1 } }, { new: true });

  res.status(200).json(new ApiResponse(200, { liked: true, likes: updatedComment.likes }, "Comment liked"));
});

export const replyToComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { message, userId } = req.body;

  if (!message?.trim()) {
    throw new ApiError(400, "Reply message is required");
  }

  const testUserId = userId || new mongoose.Types.ObjectId();

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const reply = await CommentReply.create({
    message,
    comment: commentId,
    video: comment.video,
    owner: testUserId,
  });

  await Comment.findByIdAndUpdate(commentId, {
    $push: { replies: reply._id },
  });

  const populatedReply = await reply.populate("owner", "fullName");

  res.status(201).json(
    new ApiResponse(201, {
      id: populatedReply._id,
      user: populatedReply.owner?.fullName || "Anonymous",
      avatar: populatedReply.owner?.fullName?.charAt(0) || "U",
      message: populatedReply.message,
      likes: 0,
      time: new Date(populatedReply.createdAt).toLocaleDateString(),
    }, "Reply added successfully")
  );
});

export const getReplies = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const replies = await CommentReply.find({ comment: commentId })
    .populate("owner", "fullName")
    .sort({ createdAt: -1 });

  const transformedReplies = replies.map((reply) => ({
    id: reply._id,
    user: reply.owner?.fullName || "Anonymous",
    avatar: reply.owner?.fullName?.charAt(0) || "U",
    message: reply.message,
    likes: reply.likes || 0,
    time: new Date(reply.createdAt).toLocaleDateString(),
  }));

  res.status(200).json(new ApiResponse(200, transformedReplies, "Replies fetched"));
});

export const likeReply = asyncHandler(async (req, res) => {
  const { replyId } = req.params;
  const { userId } = req.body;

  const testUserId = userId || new mongoose.Types.ObjectId();

  const existingLike = await replyLike.findOne({
    reply: replyId,
    likedBy: testUserId,
  });

  let updatedReply;
  if (existingLike) {
    await replyLike.deleteOne({ _id: existingLike._id });
    updatedReply = await CommentReply.findByIdAndUpdate(replyId, { $inc: { likes: -1 } }, { new: true });
    return res.status(200).json(new ApiResponse(200, { liked: false, likes: updatedReply.likes }, "Like removed"));
  }

  await replyLike.create({
    reply: replyId,
    likedBy: testUserId,
  });

  updatedReply = await CommentReply.findByIdAndUpdate(replyId, { $inc: { likes: 1 } }, { new: true });

  res.status(200).json(new ApiResponse(200, { liked: true, likes: updatedReply.likes }, "Reply liked"));
});
