import { Notification } from "../models/notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ owner: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Notification.countDocuments({ owner: userId });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        notifications,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      },
      "Notifications retrieved successfully"
    )
  );
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const unreadCount = await Notification.countDocuments({
    owner: userId,
    isRead: false,
  });

  res.status(200).json(
    new ApiResponse(200, { unreadCount }, "Unread count retrieved")
  );
});

const markAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user._id;

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, owner: userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  res.status(200).json(
    new ApiResponse(200, notification, "Notification marked as read")
  );
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await Notification.updateMany({ owner: userId }, { isRead: true });

  res.status(200).json(
    new ApiResponse(200, {}, "All notifications marked as read")
  );
});

const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user._id;

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    owner: userId,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  res.status(200).json(
    new ApiResponse(200, {}, "Notification deleted successfully")
  );
});

const deleteAllNotifications = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await Notification.deleteMany({ owner: userId });

  res.status(200).json(
    new ApiResponse(200, {}, "All notifications deleted successfully")
  );
});

const createNotification = async (userId, title, content, type) => {
  try {
    await Notification.create({
      title,
      content,
      type,
      owner: userId,
    });
  } catch (error) {
    console.error("Failed to create notification:", error);
  }
};

export {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  createNotification,
};
