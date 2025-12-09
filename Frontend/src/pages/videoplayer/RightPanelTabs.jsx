import React, { useState, useEffect } from "react";

const RightPanelTabs = ({
  comments,
  commentsLoading,
  sortBy,
  setSortBy,
  newComment,
  setNewComment,
  handleCommentSubmit,
  handleCommentLike,
  ads,
  recommendedVideos,
  navigateToVideo,
  formatViews,
}) => {
  const [activeTab, setActiveTab] = useState("content");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [expandedReplies, setExpandedReplies] = useState({});
  const [replies, setReplies] = useState({});
  const [openMenu, setOpenMenu] = useState(null);

  const handleReplySubmit = async (e, commentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/comments/${commentId}/replies`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: replyText }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReplies((prev) => ({
          ...prev,
          [commentId]: [...(prev[commentId] || []), data.data],
        }));
        setReplyText("");
        setReplyingTo(null);
      }
    } catch (err) {
      console.error("Failed to post reply:", err);
    }
  };

  const fetchReplies = async (commentId) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/comments/${commentId}/replies`
      );
      if (response.ok) {
        const data = await response.json();
        setReplies((prev) => ({
          ...prev,
          [commentId]: data.data || [],
        }));
      }
    } catch (err) {
      console.error("Failed to fetch replies:", err);
    }
  };

  const toggleReplies = (commentId) => {
    setExpandedReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
    if (!expandedReplies[commentId] && !replies[commentId]) {
      fetchReplies(commentId);
    }
    setOpenMenu(null);
  };

  return (
    <>
      {ads.length > 0 && (
        <div className="ads-section">
          <div className="ads-header">
            <h4>Sponsored</h4>
            <span className="ads-disclaimer">Ad</span>
          </div>
          <div className="ads-grid">
            {ads.map((ad) => (
              <div
                key={ad.id}
                className="ad-card"
                onClick={() => window.open(ad.url, "_blank")}
              >
                <div className="ad-image">
                  <img src={ad.image} alt={ad.title} />
                  <div className="ad-overlay">
                    <span className="ad-cta">Learn More</span>
                  </div>
                </div>
                <div className="ad-content">
                  <span className="ad-title">{ad.title}</span>
                  <span className="ad-advertiser">by {ad.advertiser}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="right-panel-tabs">
        <div className="tab-buttons">
          <button
            className={`tab-btn ${activeTab === "content" ? "active" : ""}`}
            onClick={() => setActiveTab("content")}
          >
            Content
          </button>
          <button
            className={`tab-btn ${activeTab === "comments" ? "active" : ""}`}
            onClick={() => setActiveTab("comments")}
          >
            Comments ({comments.length})
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "content" ? (
            <div className="video-recommendations-section">
              <div className="recommendations-header">
                <h3 className="video-recommendations-header">Up Next</h3>
                <button className="autoplay-toggle">
                  <span className="toggle-switch"></span>
                  Autoplay
                </button>
              </div>
              <div className="video-recommendations-grid">
                {recommendedVideos.map((video, index) => (
                  <div
                    key={video.id}
                    className="video-recommendation-card"
                    onClick={() => navigateToVideo(video.id)}
                  >
                    <div className="video-rec-thumbnail">
                      <img src={video.thumbnail} alt={video.title} />
                      <span className="video-rec-duration">
                        {video.duration}
                      </span>
                      {video.duration === "LIVE" && (
                        <span className="video-rec-live-indicator">
                          🔴 LIVE
                        </span>
                      )}
                      <div className="video-rec-overlay">
                        <span className="play-icon">▶</span>
                      </div>
                      {index === 0 && (
                        <div className="up-next-badge">Up Next</div>
                      )}
                    </div>

                    <div className="video-rec-info">
                      <h4 className="video-rec-title">{video.title}</h4>
                      <div className="video-rec-metadata">
                        <div className="video-rec-channel-row">
                          {video.owner?.avatar ? (
                            <img
                              src={video.owner.avatar}
                              alt={video.channel}
                              className="video-rec-channel-pic"
                              style={{
                                width: "24px",
                                height: "24px",
                                borderRadius: "50%",
                                objectFit: "cover",
                              }}
                              onError={(e) => {
                                e.target.style.display = "none";
                                e.target.nextElementSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <span
                            className="video-rec-channel-pic"
                            style={{
                              display: video.owner?.avatar ? "none" : "flex",
                              width: "24px",
                              height: "24px",
                              borderRadius: "50%",
                              backgroundColor: "#ccc",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "12px",
                              fontWeight: "bold",
                            }}
                          >
                            {video.channelAvatar}
                          </span>
                          <span className="video-rec-channel-name">
                            {video.channel}
                          </span>
                          {video.verified && (
                            <span className="verified-mini">✓</span>
                          )}
                        </div>
                        <div className="video-rec-stats">
                          <span>{formatViews(video.views)} views</span>
                          <span>•</span>
                          <span>{video.uploadedAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="video-rec-actions">
                      <button className="rec-action-btn" title="Add to queue">
                        📋
                      </button>
                      <button className="rec-action-btn" title="Save for later">
                        🕒
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="comments-section-tab">
              <div className="comments-header">
                <div className="comments-count">
                  <h3>💬 {comments.length.toLocaleString()} Comments</h3>
                  {commentsLoading && (
                    <div className="comments-loading">Loading...</div>
                  )}
                </div>
                <div className="comments-sort">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="top"> Top comments</option>
                    <option value="newest"> Newest first</option>
                    <option value="oldest"> Oldest first</option>
                  </select>
                </div>
              </div>

              <div className="comment-input-section">
                <div className="comment-avatar">YU</div>
                <form onSubmit={handleCommentSubmit} className="comment-form">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="comment-input"
                  />
                  <div className="comment-actions">
                    <button type="button" onClick={() => setNewComment("")}>
                      Cancel
                    </button>
                    <button type="submit" disabled={!newComment.trim()}>
                      Comment
                    </button>
                  </div>
                </form>
              </div>

              <div className="comments-list">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`comment-item ${
                      comment.isPinned ? "pinned" : ""
                    }`}
                  >
                    <img src={comment.profile || comment.avatar} alt={comment.user} className="comment-avatar" style={{width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover'}} />
                    <div className="comment-content">
                      <div className="comment-header">
                        <div className="comment-user-info">
                          <span className="comment-user">{comment.user}</span>
                          <span style={{fontSize: '12px', color: '#666', marginLeft: '4px'}}>@{comment.userId || 'user'}</span>
                          {comment.isVerified && (
                            <span className="verified-badge">✓</span>
                          )}
                          {comment.isPinned && (
                            <span className="pinned-badge">Pinned</span>
                          )}
                        </div>
                        <span className="comment-time">{comment.time}</span>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                      <div className="comment-actions">
                        <button
                          className={`comment-like ${
                            comment.isLiked ? "liked" : ""
                          }`}
                          onClick={() =>
                            handleCommentLike(comment.id, comment.isLiked)
                          }
                        >
                          👍 {comment.likes.toLocaleString()}
                        </button>
                        <button
                          className="comment-reply"
                          onClick={() => setReplyingTo(comment.id)}
                        >
                          Reply
                        </button>
                        <div className="comment-menu-container">
                          <button
                            className="comment-more"
                            onClick={() =>
                              setOpenMenu(
                                openMenu === comment.id ? null : comment.id
                              )
                            }
                          >
                            ⋯
                          </button>
                          {openMenu === comment.id && comment.replies > 0 && (
                            <div className="comment-menu">
                              <button
                                onClick={() => toggleReplies(comment.id)}
                                className="menu-item"
                              >
                                {expandedReplies[comment.id]
                                  ? "Hide replies"
                                  : "Show all replies"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      {replyingTo === comment.id && (
                        <form
                          onSubmit={(e) => handleReplySubmit(e, comment.id)}
                          className="reply-form"
                        >
                          <input
                            type="text"
                            placeholder="Add a reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="reply-input"
                            autoFocus
                          />
                          <div className="reply-actions">
                            <button
                              type="button"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText("");
                              }}
                            >
                              Cancel
                            </button>
                            <button type="submit" disabled={!replyText.trim()}>
                              Reply
                            </button>
                          </div>
                        </form>
                      )}
                      {expandedReplies[comment.id] && replies[comment.id] && (
                        <div className="replies-container">
                          <div
                            className="replies-header"
                            onClick={() => toggleReplies(comment.id)}
                          >
                            ↳ Hide replies
                          </div>
                          <div className="replies-list">
                            {replies[comment.id].map((reply) => (
                              <div key={reply.id} className="reply-item">
                                <img src={reply.profile || reply.avatar} alt={reply.user} className="reply-avatar" style={{width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover'}} />
                                <div className="reply-content">
                                  <div className="reply-header">
                                    <div className="reply-user-info">
                                      <span className="reply-user">
                                        {reply.user}
                                      </span>
                                      <span style={{fontSize: '11px', color: '#666', marginLeft: '4px'}}>@{reply.userId || 'user'}</span>
                                    </div>
                                    <span className="reply-time">
                                      {reply.time}
                                    </span>
                                  </div>
                                  <p className="reply-message">
                                    {reply.message}
                                  </p>
                                  <div className="reply-actions-buttons">
                                    <button className="reply-like">
                                      👍 {reply.likes || 0}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RightPanelTabs;
