import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/navbar";
import "./Notifications.css";

const Notifications = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    
    if (token) {
      fetchNotifications();
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/notifications`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch notifications");
      
      const data = await response.json();
      const formattedNotifications = data.data.notifications.map((notif) => ({
        id: notif._id,
        type: notif.type,
        message: notif.title,
        content: notif.content,
        time: new Date(notif.createdAt).toLocaleDateString(),
        read: notif.isRead,
      }));
      
      setNotifications(formattedNotifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/notifications/${notificationId}/read`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/notifications/read-all`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/notifications/${notificationId}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`,
          },
          credentials: "include",
        }
      );

      if (response.ok) {
        setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return "❤️";
      case "comment":
        return "💬";
      case "reply":
        return "↩️";
      case "subscription":
        return "🔔";
      default:
        return "📢";
    }
  };

  return (
    <>
      <div className="notifications-page">
        <div className="notifications-container">
          <div className="notifications-header">
            <h1 className="notifications-title">Notifications</h1>
            {isLoggedIn && notifications.some((n) => !n.read) && (
              <button className="mark-all-read" onClick={markAllAsRead}>
                Mark all as read
              </button>
            )}
          </div>
          {!isLoggedIn ? (
            <div className="login-prompt-box">
              <h2>Sign in to see your notifications</h2>
              <p>Get notified about new videos, comments, and updates</p>
              <div className="auth-buttons">
                <button className="login-btn" onClick={() => navigate("/login")}>
                  Login
                </button>
                <button className="signup-btn" onClick={() => navigate("/signup")}>
                  Sign Up
                </button>
              </div>
            </div>
          ) : (
            <div className="notifications-list">
              {loading ? (
                <div className="loading">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="empty-state">
                  <h3>No notifications yet</h3>
                  <p>We'll notify you when something happens</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.read ? "unread" : ""}`}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <p className="notification-message">{notification.message}</p>
                      <span className="notification-time">{notification.time}</span>
                    </div>
                    <div className="notification-actions">
                      {!notification.read && (
                        <button
                          className="mark-read-btn"
                          onClick={() => markAsRead(notification.id)}
                          title="Mark as read"
                        >
                          ✓
                        </button>
                      )}
                      <button
                        className="delete-btn"
                        onClick={() => deleteNotification(notification.id)}
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                    {!notification.read && <div className="unread-dot"></div>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Notifications;
