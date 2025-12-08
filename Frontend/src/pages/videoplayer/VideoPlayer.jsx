import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/navbar";
import RightPanelTabs from "./RightPanelTabs";
import "./videopalyer.css";
import likeIcon from "./like.png";
import afterLikeIcon from "./afterlike.png";
import saveIcon from "./save.png";
import afterSaveIcon from "./aftersave.png";
import shareIcon from "./share.png";
import downloadIcon from "./download.png";
import backIcon from "./back.png";
import pauseIcon from "./pause.png";
import resumeIcon from "./resume.png";
import volicon from "./volume.png";
import muteicon from "./mute.png";
import seticon from "./settings.png";
import timelineicon from "./timeline.png";
import ad1 from "./stocks.png";
import ad2 from "./ad_Robot.png";
import modiji from "./modiji.jpeg";
import adt1 from "./adthuu1.jpeg";
import adt2 from "./adthuu2.jpeg";
import adt3 from "./adthuu3.jpeg";
import adt4 from "./adthuu4.jpeg";

const VideoPlayer = ({ darkMode, setDarkMode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  // Video States
  const [videoData, setVideoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState("1080p");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [buffered, setBuffered] = useState(0);

  // UI States
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showClips, setShowClips] = useState(false);
  const [showComments, setShowComments] = useState(true);

  // Comments States
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [sortBy, setSortBy] = useState("top");
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Ads & Recommendations
  const [ads, setAds] = useState([]);
  const [recommendedVideos, setRecommendedVideos] = useState([]);
  const [clips, setClips] = useState([]);
  const [adVisible, setAdVisible] = useState(true);

  // Fetch video data from backend
  const fetchVideoData = useCallback(async (videoId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:4000/api/v1/videos/${videoId}`
      );
      if (!response.ok) {
        throw new Error(`Backend error: ${response.status} - Video not found`);
      }

      const result = await response.json();
      if (!result.data) {
        throw new Error("No video data in response");
      }
      const data = result.data;

      // Transform backend data to match existing UI format
      const transformedData = {
        id: data._id,
        title: data.title,
        description: data.description,
        views: `${data.views}`,
        likes: data.likes || 0,
        videoUrl: data.videoFile,
        thumbnail: data.thumbnail,
        duration: data.duration,
        uploadedAt: new Date(data.createdAt).toLocaleDateString(),
        channel: data.owner?.fullName || "Unknown Channel",
        channelId: data.owner?._id,
        channelAvatar: data.owner?.fullName?.charAt(0) || "U",
        subscribers: data.owner?.subscribersCount || "0",
        verified: data.owner?.verified || false,
        tags: data.tags || [],
        category: data.category || "General",
        language: data.language || "English",
        captions: data.captions || false,
        hd: data.quality === "HD" || false,
      };

      console.log("Backend video data:", data);
      console.log("Video URL from backend:", data.videoFile);
      console.log("Thumbnail from backend:", data.thumbnail);
      setVideoData(transformedData);
      setLikeCount(data.likes || 0);
      setError(null);
    } catch (err) {
      console.error("Backend fetch failed:", err);
      setError("Failed to load video. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch comments
  const fetchComments = useCallback(
    async (videoId) => {
      try {
        setCommentsLoading(true);
        const response = await fetch(
          `http://localhost:4000/api/v1/videos/${videoId}/comments?sort=${sortBy}`
        );
        if (!response.ok) throw new Error("Failed to fetch comments");
        const data = await response.json();
        console.log("Comments data:", data.data);
        setComments(data.data || []);
      } catch (err) {
        console.error("Failed to fetch comments:", err);
        setComments([]);
      } finally {
        setCommentsLoading(false);
      }
    },
    [sortBy]
  );

  // Fetch recommendations and ads
const fetchRecommendations = useCallback(async (videoId) => {
  try {
    const recsResponse = await fetch(
      `http://localhost:4000/api/v1/videos/${videoId}/recommendations`
    );

    if (!recsResponse.ok) {
      throw new Error("Failed to fetch recommendations");
    }

    const recsData = await recsResponse.json();
    const videos = recsData.data?.videos || [];
    setRecommendedVideos(videos.length > 0 ? videos : []);
    setAds([]);
    setClips([]);
    console.log("Recommendations data:", videos);
  } catch (err) {
    console.error("Failed to fetch recommendations:", err);
    setRecommendedVideos([]);
    setAds([]);
    setClips([]);
  }
}, []);


  // Mock data for development (fallback only)
  // const mockVideoData = {
  //   id: id,
  //   title: "Modi's Historic Speech on Digital India 2024: Complete Analysis",
  //   views: "15.2M",
  //   uploadedAt: "2 hours ago",
  //   likes: "892K",
  //   dislikes: "12K",
  //   channel: "BharatWatch Official",
  //   channelId: "bharatwatch-official",
  //   channelAvatar: "BW",
  //   subscribers: "2.5M",
  //   verified: true,
  //   description: "Prime Minister Modi delivers a groundbreaking speech on India's digital transformation, outlining revolutionary policies that will shape the nation's technological future. This historic address covers key initiatives in AI, blockchain, and digital infrastructure development.",
  //   tags: ["Modi", "Digital India", "Technology", "Politics", "Analysis"],
  //   videoUrl: "/api/placeholder/video",
  //   thumbnail: modiji,
  //   duration: 1847,
  //   category: "News & Politics",
  //   language: "Hindi",
  //   captions: true,
  //   hd: true,
  //   uploadDate: "2024-01-15T10:30:00Z"
  // };

  // const mockClips = [
  //   { id: 1, title: "Modi's Key Points on AI", time: "2:15", startTime: 135, thumbnail: modiji },
  //   { id: 2, title: "Digital Infrastructure Plans", time: "8:30", startTime: 510, thumbnail: modiji},
  //   { id: 3, title: "Blockchain Initiative", time: "12:45", startTime: 765, thumbnail: modiji },
  //   { id: 4, title: "Future Tech Roadmap", time: "18:20", startTime: 1100, thumbnail: modiji},
  //   { id: 5, title: "AI in Healthcare", time: "22:10", startTime: 1300, thumbnail: modiji}
  // ];

  // const mockAds = [
  //   {
  //     id: 1,
  //     title: "Invest in Digital India Stocks - Get 20% Bonus",
  //     url: "#",
  //     image: ad1,
  //     type: "sponsored",
  //     advertiser: "Zerodha"
  //   }
  // ];

  // const mockComments = [
  //   {
  //     id: 1,
  //     user: "Rajesh Kumar",
  //     userId: "rajesh_kumar_123",
  //     avatar: "RK",
  //     time: "2 hours ago",
  //     text: "Excellent analysis of Modi's digital vision! This will transform India's tech landscape. 🚀",
  //     likes: 234,
  //     replies: 12,
  //     isLiked: false,
  //     isPinned: true,
  //     isVerified: false
  //   },
  //   {
  //     id: 2,
  //     user: "Priya Sharma",
  //     userId: "priya_tech_analyst",
  //     avatar: "PS",
  //     time: "3 hours ago",
  //     text: "The blockchain initiatives mentioned here are game-changing. Great breakdown of the policy implications.",
  //     likes: 189,
  //     replies: 8,
  //     isLiked: true,
  //     isPinned: false,
  //     isVerified: true
  //   },
  //   {
  //     id: 3,
  //     user: "Tech Enthusiast",
  //     userId: "tech_enthusiast_2024",
  //     avatar: "TE",
  //     time: "4 hours ago",
  //     text: "Finally someone explaining these policies in simple terms. Keep up the great work BharatWatch! 👏",
  //     likes: 156,
  //     replies: 5,
  //     isLiked: false,
  //     isPinned: false,
  //     isVerified: false
  //   },
  //   {
  //     id: 4,
  //     user: "Mumbai Investor",
  //     userId: "mumbai_investor_pro",
  //     avatar: "MI",
  //     time: "5 hours ago",
  //     text: "This is why I follow this channel. In-depth analysis with real insights. 🔥",
  //     likes: 98,
  //     replies: 3,
  //     isLiked: false,
  //     isPinned: false,
  //     isVerified: false
  //   }
  // ];

  // const mockRecommendedVideos = [
  //   {
  //     id: 2,
  //     title: "Supreme Court Article 370 Verdict: Complete Analysis",
  //     thumbnail: adt1,
  //     duration: "18:45",
  //     views: "12.4M",
  //     uploadedAt: "4 hours ago",
  //     channel: "Republic TV",
  //     channelAvatar: "RT",
  //     verified: true
  //   },
  //   {
  //     id: 3,
  //     title: "India vs Australia Cricket World Cup Final 2024",
  //     thumbnail: adt2,
  //     duration: "LIVE",
  //     views: "8.7M",
  //     uploadedAt: "streaming now",
  //     channel: "Star Sports",
  //     channelAvatar: "SS",
  //     verified: true
  //   },
  //   {
  //     id: 4,
  //     title: "Shah Rukh Khan's New Movie Trailer Breaks Internet",
  //     thumbnail: adt3,
  //     duration: "15:20",
  //     views: "9.8M",
  //     uploadedAt: "6 hours ago",
  //     channel: "Bollywood Hungama",
  //     channelAvatar: "BH",
  //     verified: false
  //   },
  //   {
  //     id: 5,
  //     title: "iPhone 16 vs Samsung Galaxy S24: Indian Price War",
  //     thumbnail: adt4,
  //     duration: "22:15",
  //     views: "5.6M",
  //     uploadedAt: "8 hours ago",
  //     channel: "Technical Guruji",
  //     channelAvatar: "TG",
  //     verified: true
  //   },
  //   {
  //     id: 6,
  //     title: "Budget 2024: Key Highlights That Will Impact You",
  //     thumbnail: ad2,
  //     duration: "12:30",
  //     views: "3.2M",
  //     uploadedAt: "12 hours ago",
  //     channel: "Economic Times",
  //     channelAvatar: "ET",
  //     verified: true
  //   },
  //   {
  //     id: 7,
  //     title: "How to be a software developer in 2026",
  //     thumbnail: ad1,
  //     duration: "10:7",
  //     views: "69k",
  //     uploadedAt: "12 hours ago",
  //     channel: "Techie Anant",
  //     channelAvatar: "TA",
  //     verified: false
  //   }
  // ];

  // Video player functions
  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);

      // Update buffered
      const bufferedEnd =
        videoRef.current.buffered.length > 0
          ? videoRef.current.buffered.end(videoRef.current.buffered.length - 1)
          : 0;
      setBuffered((bufferedEnd / videoRef.current.duration) * 100);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  }, []);

  const handleSeek = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const time = pos * duration;
      if (videoRef.current) {
        videoRef.current.currentTime = time;
        setCurrentTime(time);
      }
    },
    [duration]
  );

  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const changePlaybackRate = useCallback((rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
    setShowSettings(false);
  }, []);

  const changeQuality = useCallback((newQuality) => {
    setQuality(newQuality);
    // Here you would change the video source based on quality
    setShowSettings(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const seekToClip = useCallback(
    (startTime) => {
      if (videoRef.current) {
        videoRef.current.currentTime = startTime;
        setCurrentTime(startTime);
        if (!isPlaying) {
          videoRef.current.play();
          setIsPlaying(true);
        }
      }
      setShowClips(false);
    },
    [isPlaying]
  );

  // User interaction functions
  const handleLike = useCallback(async () => {
    if (!localStorage.getItem("accessToken")) {
      alert("Please login to like videos");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/videos/${id}/like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const newLiked = data.data?.isLiked || !isLiked;
        setIsLiked(newLiked);
        setLikeCount(prev => newLiked ? prev + 1 : prev - 1);
      }
    } catch (err) {
      console.error("Failed to like video:", err);
    }
  }, [id, isLiked]);

  const handleSave = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/videos/${id}/watchlater`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (response.ok) {
        setIsSaved(!isSaved);
      }
    } catch (err) {
      console.error("Failed to save video:", err);
      setIsSaved(!isSaved);
    }
  }, [id, isSaved]);

  const handleSubscribe = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/v1/channels/${videoData?.channelId}/subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: isSubscribed ? "unsubscribe" : "subscribe",
          }),
        }
      );

      if (response.ok) {
        setIsSubscribed(!isSubscribed);
      }
    } catch (err) {
      console.error("Failed to subscribe:", err);
    }
  }, [videoData?.channelId, isSubscribed]);

  const handleCommentSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!newComment.trim()) return;

      if(!localStorage.getItem("accessToken")){
        alert("Please login to comment");
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:4000/api/v1/videos/${id}/comments`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: newComment }),
          }
        );

        if (response.ok) {
          const responsedata = await response.json();
          const newCommentData = responsedata.data;
          setComments([responsedata.data, ...comments]);
          setNewComment("");
        }
      } catch (err) {
        console.error("Failed to post comment:", err);
      }
    },
    [id, newComment, comments]
  );

  const handleCommentLike = useCallback(
    async (commentId, isLiked) => {
      if(!localStorage.getItem("accessToken")){
        alert("Please login to like comments");
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:4000/api/v1/comments/${commentId}/like`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: isLiked ? "unlike" : "like" }),
          }
        );

        if (response.ok) {
          setComments(
            comments.map((comment) =>
              comment.id === commentId
                ? {
                    ...comment,
                    isLiked: !isLiked,
                    likes: isLiked ? comment.likes - 1 : comment.likes + 1,
                  }
                : comment
            )
          );
        }
      } catch (err) {
        console.error("Failed to like comment:", err);
      }
    },
    [comments]
  );

  const navigateToVideo = useCallback(
    (videoId) => {
      navigate(`/videoplayer/${videoId}`);
    },
    [navigate]
  );

  const formatTime = useCallback((time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  const formatViews = useCallback((views) => {
    if (!views) return "0";
    const num = parseInt(String(views).replace(/[^0-9]/g, ""));
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  }, []);

  // Effects
  useEffect(() => {
    if (id) {
      fetchVideoData(id);
      fetchComments(id);
      fetchRecommendations(id);
    }
  }, [id, fetchVideoData, fetchComments, fetchRecommendations]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          handlePlayPause();
          break;
        case "ArrowLeft":
          if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, currentTime - 10);
          }
          break;
        case "ArrowRight":
          if (videoRef.current) {
            videoRef.current.currentTime = Math.min(duration, currentTime + 10);
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          setVolume((prev) => Math.min(1, prev + 0.1));
          break;
        case "ArrowDown":
          e.preventDefault();
          setVolume((prev) => Math.max(0, prev - 0.1));
          break;
        case "m":
        case "M":
          toggleMute();
          break;
        case "f":
        case "F":
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handlePlayPause, currentTime, duration, toggleMute, toggleFullscreen]);

  useEffect(() => {
    if (sortBy && id) {
      fetchComments(id);
    }
  }, [sortBy, id, fetchComments]);

  // Loading state
  if (loading) {
    return (
      <>
        {/* <Navbar darkMode={darkMode} setDarkMode={setDarkMode} /> */}
        <div className="video-player-page">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading amazing content...</p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        {/* <Navbar darkMode={darkMode} setDarkMode={setDarkMode} /> */}
        <div className="video-player-page">
          <div className="error-container">
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        </div>
      </>
    );
  }

  if (!videoData) return null;

  return (
    <>
      {/* <Navbar darkMode={darkMode} setDarkMode={setDarkMode} /> */}
      <div className={`video-player-page ${darkMode ? "dark" : ""}`}>
        <div className="video-player-container">
          <div className="video-main-content">
            <div className="video-player-wrapper">
              <div
                className="video-player-frame"
                ref={playerRef}
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => setShowControls(false)}
              >
                <video
                  ref={videoRef}
                  id={`video-${videoData.id}`}
                  poster={videoData.thumbnail}
                  className="video-main-player"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onClick={handlePlayPause}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  preload="metadata"
                >
                  {videoData.videoUrl && (
                    <source src={videoData.videoUrl} type="video/mp4" />
                  )}
                  {videoData.captions && (
                    <track
                      kind="captions"
                      src={`http://localhost:4000/api/v1/videos/${videoData.id}/captions`}
                      srcLang="en"
                      label="English"
                    />
                  )}
                  Your browser does not support the video tag.
                </video>

                {/* Buffering indicator */}
                {loading && (
                  <div className="buffering-indicator">
                    <div className="spinner"></div>
                  </div>
                )}

                <div
                  className={`custom-controls ${showControls ? "visible" : ""}`}
                >
                  <div className="progress-container">
                    <div className="video-progress-bar" onClick={handleSeek}>
                      <div
                        className="video-progress-fill"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="controls-row">
                    <div className="controls-left">
                      <button
                        className="control-btn vp-play-pause-btn"
                        onClick={handlePlayPause}
                      >
                        <img
                          src={isPlaying ? pauseIcon : resumeIcon}
                          alt={isPlaying ? "Pause" : "Play"}
                          className="control-icon"
                        />
                      </button>
                      <button
                        className="control-btn vp-volume-btn"
                        onClick={toggleMute}
                      >
                        <img
                          src={isMuted ? muteicon : volicon}
                          alt={isMuted ? "Unmute" : "Mute"}
                          className="control-icon"
                        />
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="volume-slider"
                      />
                      <span className="time-display">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="controls-right">
                      <button
                        className="control-btn"
                        onClick={() => setShowClips(!showClips)}
                      >
                        <img
                          src={timelineicon}
                          alt="Timeline"
                          className="control-icon"
                        />
                      </button>
                      <div className="settings-dropdown">
                        <button
                          className="control-btn vp-settings-btn"
                          onClick={() => setShowSettings(!showSettings)}
                        >
                          <img
                            src={seticon}
                            alt="Settings"
                            className="control-icon"
                          />
                        </button>
                        {showSettings && (
                          <div className="settings-menu">
                            <div className="setting-section">
                              <h4>Playback Speed</h4>
                              <div className="speed-options">
                                {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(
                                  (speed) => (
                                    <button
                                      key={speed}
                                      className={`speed-btn ${
                                        playbackRate === speed ? "active" : ""
                                      }`}
                                      onClick={() => changePlaybackRate(speed)}
                                    >
                                      {speed === 1 ? "Normal" : `${speed}x`}
                                    </button>
                                  )
                                )}
                              </div>
                            </div>
                            <div className="setting-section">
                              <h4>Quality</h4>
                              <div className="quality-options">
                                {[
                                  "144p",
                                  "240p",
                                  "360p",
                                  "480p",
                                  "720p",
                                  "1080p",
                                  "1440p",
                                  "2160p",
                                ].map((qual) => (
                                  <button
                                    key={qual}
                                    className={`quality-btn ${
                                      quality === qual ? "active" : ""
                                    }`}
                                    onClick={() => changeQuality(qual)}
                                  >
                                    {qual === "2160p" ? "4K" : qual}
                                    {qual === quality && videoData.hd && " HD"}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="setting-section">
                              <h4>Captions</h4>
                              <div className="caption-options">
                                <button className="caption-btn">Off</button>
                                <button className="caption-btn active">
                                  English
                                </button>
                                <button className="caption-btn">Hindi</button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        className="control-btn"
                        onClick={toggleFullscreen}
                      >
                        {isFullscreen ? "🗗" : "⛶"}
                      </button>
                    </div>
                  </div>
                </div>

                {adVisible && (
                  <div className="video-ad-banner">
                    <div className="video-ad-content">
                      <span className="video-ad-text">Ad</span>
                      <button
                        className="video-ad-dismiss"
                        onClick={() => setAdVisible(false)}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {showClips && clips.length > 0 && (
                <div className="clips-section">
                  <div className="clips-header">
                    <h4>🎬 Key Moments</h4>
                    <button
                      className="close-clips"
                      onClick={() => setShowClips(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="clips-grid">
                    {clips.map((clip) => (
                      <div
                        key={clip.id}
                        className="clip-item"
                        onClick={() => seekToClip(clip.startTime)}
                      >
                        <div className="clip-thumbnail">
                          <img src={clip.thumbnail} alt={clip.title} />
                          <div className="clip-play-overlay">
                            <span className="play-icon">▶</span>
                          </div>
                        </div>
                        <div className="clip-info">
                          <span className="clip-title">{clip.title}</span>
                          <span className="clip-time">{clip.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="video-content-info">
                <h1 className="video-headline" id={`title-${videoData.id}`}>
                  {videoData.title}
                </h1>

                <div className="video-meta-actions">
                  <div className="video-stats">
                    <span className="video-views">
                      {formatViews(videoData.views)} views
                    </span>
                    <span className="video-stat-separator">•</span>
                    <span className="video-upload-date">
                      {videoData.uploadedAt}
                    </span>
                    <span className="video-stat-separator">•</span>
                    <span className="video-duration">
                      {formatTime(videoData.duration)}
                    </span>
                  </div>
                </div>

                <div className="video-actions-container">
                  <button
                    className={`action-btn like-btn ${isLiked ? "liked" : ""}`}
                    onClick={handleLike}
                    id={`like-${videoData.id}`}
                    title="Like this video"
                  >
                    <img
                      src={isLiked ? afterLikeIcon : likeIcon}
                      alt="Like"
                      className="action-icon"
                    />
                    <span className="action-text">
                      {likeCount >= 1000 ? `${(likeCount / 1000).toFixed(1)}K` : likeCount} Likes
                    </span>
                  </button>

                  <button
                    className="action-btn share-btn"
                    id={`share-${videoData.id}`}
                    title="Share this video"
                    onClick={() =>
                      navigator.share?.({
                        title: videoData.title,
                        url: window.location.href,
                      }) || navigator.clipboard.writeText(window.location.href)
                    }
                  >
                    <img src={shareIcon} alt="Share" className="action-icon" />
                    <span className="action-text">Share</span>
                  </button>

                  <button
                    className={`action-btn save-btn ${isSaved ? "saved" : ""}`}
                    onClick={handleSave}
                    id={`save-${videoData.id}`}
                    title={
                      isSaved ? "Remove from saved" : "Save to watch later"
                    }
                  >
                    <img
                      src={isSaved ? afterSaveIcon : saveIcon}
                      alt="Save"
                      className="action-icon"
                    />
                    <span className="action-text">
                      {isSaved ? "Saved" : "Save"}
                    </span>
                  </button>

                  <button
                    className="action-btn download-btn"
                    title="Download video"
                  >
                    <img
                      src={downloadIcon}
                      alt="Download"
                      className="action-icon"
                    />
                    <span className="action-text">Download</span>
                  </button>
                </div>

                <div className="channel-section">
                  <div className="channel-info">
                    <div className="channel-avatar">
                      {videoData.channelAvatar}
                    </div>
                    <div className="channel-details">
                      <div className="channel-name">
                        {videoData.channel}
                        {videoData.verified && (
                          <span className="verified-badge">✓</span>
                        )}
                      </div>
                      <div className="subscriber-count">
                        {videoData.subscribers} Followers
                      </div>
                    </div>
                  </div>

                  <button
                    className={`subscribe-btn ${
                      isSubscribed ? "subscribed" : ""
                    }`}
                    onClick={handleSubscribe}
                  >
                    {isSubscribed ? "Following" : "Follow"}
                  </button>
                </div>

                <div className="description-section">
                  <div
                    className={`description-content ${
                      showDescription ? "expanded" : ""
                    }`}
                  >
                    <h2 className="Description-title"> Description </h2>
                    <p className="description-text">{videoData.description}</p>
                    <div className="video-tags">
                      {videoData.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    className="expand-btn"
                    onClick={() => setShowDescription(!showDescription)}
                  >
                    {showDescription ? "Show less" : "Show more"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="video-recommendations-panel">
            <RightPanelTabs
              comments={comments}
              commentsLoading={commentsLoading}
              sortBy={sortBy}
              setSortBy={setSortBy}
              newComment={newComment}
              setNewComment={setNewComment}
              handleCommentSubmit={handleCommentSubmit}
              handleCommentLike={handleCommentLike}
              ads={ads}
              recommendedVideos={recommendedVideos}
              navigateToVideo={navigateToVideo}
              formatViews={formatViews}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoPlayer;

// TODO: Backend Integration Checklist
// 1. Replace mock data with actual API calls
// 2. Implement video streaming with adaptive bitrate
// 3. Add real-time comment updates
// 4. Implement user authentication
// 5. Add video analytics tracking
// 6. Implement recommendation algorithm
// 7. Add video upload and processing
// 8. Implement live streaming support
// 9. Add monetization features
// 10. Implement content moderation
