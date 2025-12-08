import { Router } from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notification.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.route("/").get(getNotifications);
router.route("/unread-count").get(getUnreadCount);
router.route("/:notificationId/read").patch(markAsRead);
router.route("/read-all").patch(markAllAsRead);
router.route("/:notificationId").delete(deleteNotification);
router.route("/").delete(deleteAllNotifications);

export default router;
