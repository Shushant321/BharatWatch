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
  const { text, userId, userName } = req.body;

  if (!text?.trim()) {
    throw new ApiError(400, "Comment text is required");
  }

  const testUserId = userId || new mongoose.Types.ObjectId();
  const commenter = await User.findById(testUserId);

  const comment = await Comment.create({
    content: text,
    video: videoId,
    owner: testUserId,
    userName: userName || commenter?.fullName || "Anonymous",
    userAvatar: commenter?.avatar || "",
  });

  await Video.findByIdAndUpdate(videoId, { $inc: { commentsCount: 1 } });

  const video = await Video.findById(videoId);
  await createNotification(
    video.owner,
    `${userName || commenter?.fullName || "Someone"} commented on your video`,
    `"${video.title}" has a new comment`,
    "comment"
  );

  const transformed = {
    id: comment._id,
    user: comment.userName,
    userId: comment.owner,
    profile: comment.userAvatar,
    avatar: comment.userName?.charAt(0) || "A",
    time: new Date(comment.createdAt).toLocaleDateString(),
    text: comment.content,
    likes: 0,
    replies: 0,
  };

  res.status(201).json(new ApiResponse(201, transformed, "Comment added successfully"));
});

export const getComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const comments = await Comment.find({ video: videoId }).sort({ createdAt: -1 });

  const transformedComments = comments.map((comment) => ({
    id: comment._id,
    user: comment.userName || "Anonymous",
    userId: comment.owner,
    profile: comment.userAvatar,
    avatar: (comment.userName || "Anonymous")?.charAt(0) || "A",
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
  const { message, userId, userName } = req.body;

  if (!message?.trim()) {
    throw new ApiError(400, "Reply message is required");
  }

  const testUserId = userId || new mongoose.Types.ObjectId();
  const replier = await User.findById(testUserId);

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const reply = await CommentReply.create({
    message,
    comment: commentId,
    video: comment.video,
    owner: testUserId,
    userName: userName || replier?.fullName || "Anonymous",
    userAvatar: replier?.avatar || "",
  });

  await Comment.findByIdAndUpdate(commentId, {
    $push: { replies: reply._id },
  });

  res.status(201).json(
    new ApiResponse(201, {
      id: reply._id,
      user: reply.userName,
      userId: reply.owner,
      profile: reply.userAvatar,
      avatar: reply.userName?.charAt(0) || "U",
      message: reply.message,
      likes: 0,
      time: new Date(reply.createdAt).toLocaleDateString(),
    }, "Reply added successfully")
  );
});

export const getReplies = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  const replies = await CommentReply.find({ comment: commentId }).sort({ createdAt: -1 });

  const transformedReplies = replies.map((reply) => ({
    id: reply._id,
    user: reply.userName || "Anonymous",
    userId: reply.owner,
    profile: reply.userAvatar,
    avatar: (reply.userName || "Anonymous")?.charAt(0) || "U",
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
