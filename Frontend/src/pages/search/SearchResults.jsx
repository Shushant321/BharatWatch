import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api.js";
import "./searchresult.css";

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const query = new URLSearchParams(location.search).get("q") || "";

  const formatViews = (count) => {
    if (!count) return "0 views";
    if (count >= 1e6) return (count / 1e6).toFixed(1) + "M views";
    if (count >= 1e3) return (count / 1e3).toFixed(1) + "K views";
    return count + " views";
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return hrs > 0
      ? `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
      : `${mins}:${String(secs).padStart(2, "0")}`;
  };

  const formatDate = (date) => {
    if (!date) return "";
    const now = new Date();
    const uploaded = new Date(date);
    const diff = Math.floor((now - uploaded) / 1000);
    
    if (diff < 60) return "just now";
    if (diff < 3600) return Math.floor(diff / 60) + " minutes ago";
    if (diff < 86400) return Math.floor(diff / 3600) + " hours ago";
    if (diff < 604800) return Math.floor(diff / 86400) + " days ago";
    if (diff < 2592000) return Math.floor(diff / 604800) + " weeks ago";
    if (diff < 31536000) return Math.floor(diff / 2592000) + " months ago";
    return Math.floor(diff / 31536000) + " years ago";
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!query.trim()) {
        setVideos([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await api.searchVideos(query);
        setVideos(res.data || res);
      } catch (e) {
        console.error("Search error:", e);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [query]);

  if (loading) {
    return (
      <div className="search-page">
        <div className="search-loading">
          <div className="loader"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-page">
      {videos.length === 0 ? (
        <div className="search-empty">
          <p>No results found for "{query}"</p>
          <small>Try different keywords</small>
        </div>
      ) : (
        <div className="search-results">
          {videos.map((video) => (
            <div
              key={video._id}
              className="search-item"
              onClick={() => navigate(`/video/${video._id}`)}
            >
              <div className="search-thumb">
                <img src={video.thumbnail || "/default-thumbnail.png"} alt={video.title} />
                {video.duration && <span className="duration">{formatDuration(video.duration)}</span>}
              </div>

              <div className="search-details">
                <h3 className="video-title">{video.title}</h3>
                <div className="video-meta">
                  <span>{formatViews(video.views)}</span>
                  <span>•</span>
                  <span>{formatDate(video.createdAt)}</span>
                </div>
                <div className="channel-info">
                  <img src={video.owner?.avatar || "/default-avatar.png"} alt="" className="channel-avatar" />
                  <span className="channel-name">{video.owner?.fullName || video.owner?.username || "Unknown"}</span>
                </div>
                <p className="video-desc">{video.description?.slice(0, 120) || "No description"}...</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
