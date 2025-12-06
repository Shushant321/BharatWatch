import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./RecommendedVideos.css";
import { api } from "../../api";
import sundar from "./sundar pichayi.jpeg";
import thum2 from "./thum2.png";
import thum3 from "./thum3.png";
import thum4 from "./thum4.png";
import profile1 from "./profile9.jpeg";

const demoImages = [
  {
    url: sundar,
    title: "Google deemed exposed | Sundar",
    author: "Demo Creator", // chanel name ka limit 17 characters ka hoga isse jada nhi
    profile: profile1,
    views: "2.1K Views",
    time: "2 Days Ago",
  },
  {
    url: thum2,
    title: "The Rise and Fall of Mughal Empire | Animated India ",
    author: "Animated India",
    profile: profile1,
    views: "30M Views",
    time: "12 Years Ago",
  },
  {
    url: thum3,
    title: "Biggest Lie | How to Know if it's Fake or Lie | Shushant Upadhyay",
    author: "Shushant Upadhyay",
    profile: profile1,
    views: "110k Views",
    time: "2 Days Ago",
  },
  {
    url: thum4,
    title: "1500 ELO Chess Game | How To Be in Top 10% in Chess Field",
    author: "Shushant Upadhyay",
    profile: profile1,
    views: "110k Views",
    time: "2 Days Ago",
  },
  {
    url: sundar,
    title: "Google deemed exposed | Sundar",
    author: "Demo Creator", // chanel name ka limit 17 characters ka hoga isse jada nhi
    profile: profile1,
    views: "2.1K Views",
    time: "2 Days Ago",
  },
  {
    url: thum2,
    title: "The Rise and Fall of Mughal Empire | Animated India ",
    author: "Animated India",
    profile: profile1,
    views: "30M Views",
    time: "12 Years Ago",
  },
  {
    url: thum3,
    title: "Biggest Lie | How to Know if it's Fake or Lie | Shushant Upadhyay",
    author: "Shushant Upadhyay",
    profile: profile1,
    views: "110k Views",
    time: "2 Days Ago",
  },
  {
    url: thum4,
    title: "1500 ELO Chess Game | How To Be in Top 10% in Chess Field",
    author: "Shushant Upadhyay",
    profile: profile1,
    views: "110k Views",
    time: "2 Days Ago",
  },
  {
    url: sundar,
    title: "Google deemed exposed | Sundar",
    author: "Demo Creator", // chanel name ka limit 17 characters ka hoga isse jada nhi
    profile: profile1,
    views: "2.1K Views",
    time: "2 Days Ago",
  },
  {
    url: thum2,
    title: "The Rise and Fall of Mughal Empire | Animated India ",
    author: "Animated India",
    profile: profile1,
    views: "30M Views",
    time: "12 Years Ago",
  },
  {
    url: thum3,
    title: "Biggest Lie | How to Know if it's Fake or Lie | Shushant Upadhyay",
    author: "Shushant Upadhyay",
    profile: profile1,
    views: "110k Views",
    time: "2 Days Ago",
  },
  {
    url: thum4,
    title: "1500 ELO Chess Game | How To Be in Top 10% in Chess Field",
    author: "Shushant Upadhyay",
    profile: profile1,
    views: "110k Views",
    time: "2 Days Ago",
  },
  // ...rest
];

const RecommendedVideos = ({ videos = [] }) => {
  const navigate = useNavigate();
  const [realVideos, setRealVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await api.getAllVideos();
        if (response && response.data) {
          setRealVideos(Array.isArray(response.data) ? response.data : []);
          console.log( "Videos Loaded : ", response.data?.length);
        }
      } catch (error) {
        console.error("Failed to fetch videos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const itemsToShow =
    realVideos.length > 0
      ? realVideos.map((video) => ({
          id: video._id,
          url: video.thumbnail || (video.videoFile ? video.videoFile.replace(
            '/\/upload/w_320,h_180,c_fill/,q_auto/')
            .replace(/\.[^/.]+$/, '.jpg'
          ): thum2),
          title: video.title,
          author: video.owner?.fullName || "Unknown",
          profile: video.owner?.avatar || null,
          views: `${video.views} Views`,
          time: new Date(video.createdAt).toLocaleDateString(),
        }))
      : demoImages;

  return (
    <section className="yt-section">
      <div className="yt-recommended-section">
        <div className="yt-recommended-header">
          <h2 className="yt-recommended-title">Recommended Videos</h2>
        </div>
        <div className="yt-recommended-grid">
          {itemsToShow.map((item, index) => (
            <div
              className="yt-rec-card"
              key={index}
              onClick={() => navigate(`/videoplayer/${item.id || index}`)}
              tabIndex={0}
            >
              <div className="yt-rec-thumb-wrap">
                <img
                  className="yt-rec-thumb"
                  src={item.url}
                  alt={item.title || "Demo thumbnail"}
                />
              </div>
              <div className="yt-rec-info">
                <div className="yt-rec-title">
                  {item.title || "Untitled Video"}
                </div>
                <div className="yt-rec-metarow">
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1, minWidth: 0 }}>
                    {item.profile ? (
                      <img
                        src={item.profile}
                        alt={item.author}
                        className="yt-rec-profile"
                        style={{ width: "26px", height: "26px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextElementSibling.style.display = "flex";
                        }}
                      />
                    ) : null}
                    <div
                      className="yt-rec-profile-fallback"
                      style={{
                        display: item.profile ? "none" : "flex",
                        width: "26px",
                        height: "26px",
                        borderRadius: "50%",
                        backgroundColor: "#ccc",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: "bold",
                        flexShrink: 0,
                      }}
                    >
                      {item.author?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span 
                      className="yt-rec-channel"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/channel/${item.author?.toLowerCase().replace(/\s+/g, '')}`);
                      }}
                      style={{cursor: 'pointer', minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}
                      title={item.author}
                    >
                      {item.author}
                    </span>
                  </div>
                  <span className="yt-rec-dot">•</span>
                  <span>{item.views}</span>
                  <span className="yt-rec-dot">•</span>
                  <span>{item.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecommendedVideos;
