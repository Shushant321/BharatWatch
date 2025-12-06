import React, { useState, useRef, useEffect } from "react";
import "./uploadVideo.css";
import { useLocation } from "react-router-dom";

const UploadVideo = () => {
  const location = useLocation();
  const editDraft = location.state?.editDraft; 
  const draftId = location.state?.draftId;
  const draftType = location.state?.draftType;
  const [isDraft, setIsDraft] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState(draftType || null); // "video" or "snip"
  const [videoDetails, setVideoDetails] = useState({
    title: "",
    description: "",
    tags: "",
    category: "Education",
    visibility: "public",
    thumbnail: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);

  const [isEditingVideo, setIsEditingVideo] = useState(false)
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  useEffect(() => {
  if (editDraft && draftType) {
    setUploadType(draftType);
    setVideoDetails({
      title: editDraft.title || "",
      description: editDraft.description || "",
      tags: editDraft.tags || "",
      category: editDraft.category || "Education",
      visibility: editDraft.visibility || "public",
      thumbnail: null,
    });
    setPreviewUrl(editDraft.url);
    setSelectedFile({ name: editDraft.title, size: 0 });
  }
}, [editDraft, draftType]);




  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (file && file.type.startsWith("video/")) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setIsEditingVideo(false);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleThumbnailSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setVideoDetails((prev) => ({ ...prev, thumbnail: file }));
      console.log("Thumbnail selected:", file.name);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setVideoDetails((prev) => ({ ...prev, [name]: value }));
  };

  // --------- FIXED UPLOAD FUNCTION ---------
  const uploadToCloudinary = async (draft = false) => {
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      if(selectedFile && selectedFile.type){
         formData.append("videoFile", selectedFile);
      }
      formData.append("title", videoDetails.title);
      formData.append("description", videoDetails.description);
      formData.append("visibility", videoDetails.visibility);
      formData.append("isDraft", draft ? "true" : "false"); // must be "true"/"false" string

      if (uploadType === "video") {
        if (videoDetails.thumbnail) {
          formData.append("thumbnail", videoDetails.thumbnail);
          console.log("Appending thumbnail to FormData");
        }
        if (videoDetails.category) formData.append("category", videoDetails.category);
      }
      if (videoDetails.tags) formData.append("tags", videoDetails.tags);

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      const endpoint =
        uploadType === "video"
          ? "http://localhost:4000/api/v1/videos/upload"
          : "http://localhost:4000/api/snips/upload";
      
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (response.ok) {
        setUploadProgress(100);
        setTimeout(() => {
          alert(
            `${uploadType === "video" ? "Video" : "Snip"} uploaded successfully!`
          );
          setSelectedFile(null);
          setPreviewUrl(null);
          setUploadType(null);
          setVideoDetails({
            title: "",
            description: "",
            tags: "",
            category: "Education",
            visibility: "public",
            thumbnail: null,
          });
          setIsUploading(false);
          setUploadProgress(0);
        }, 1000);
      } else {
        const error = await response.json();
        throw new Error(error.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Upload failed: ${error.message}`);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Draft/Publish button handlers
  const handleUploadWithDraft = (draft) => {
    setIsDraft(draft);
    uploadToCloudinary(draft);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedFile && videoDetails.title) {
      uploadToCloudinary(false); // publish by default
    }
  };

  const resetUploadType = () => {
    setUploadType(null);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  // ---------- RENDER ----------
  return (
    <>
      <div className="upload-container">
        <div className="floating-particles">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>
        <div className="upload-wrapper">
          <div className="upload-header">
            <h1 className="upload-title">
              <span className="upload-icon">🎬</span>
              Upload Your Content
            </h1>
            <p className="upload-subtitle">Share your story with the world</p>
          </div>

          {!uploadType ? (
            <div className="upload-type-selection">
              <div className="type-options">
                <div
                  className="type-card video-card"
                  onClick={() => setUploadType("video")}
                >
                  <div className="type-icon">🎥</div>
                  <h3>Upload Video</h3>
                  <p>Share full-length videos with your audience</p>
                </div>
                <div
                  className="type-card snip-card"
                  onClick={() => setUploadType("snip")}
                >
                  <div className="type-icon">⚡</div>
                  <h3>Upload Snip</h3>
                  <p>Share short, engaging clips with your audience</p>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="upload-form">
              {!selectedFile ? (
                <div
                  className={`upload-dropzone ${dragActive ? "drag-active" : ""}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="dropzone-content">
                    <div className="upload-animation">
                      <div className="upload-circle">
                        {/* upload icon */}
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                                stroke="currentColor" strokeWidth="2" />
                          <polyline points="14,2 14,8 20,8"
                                 stroke="currentColor" strokeWidth="2" />
                          <line x1="16" y1="13" x2="8" y2="13"
                                stroke="currentColor" strokeWidth="2" />
                          <line x1="16" y1="17" x2="8" y2="17"
                                stroke="currentColor" strokeWidth="2" />
                          <polyline points="10,9 9,9 8,9"
                                 stroke="currentColor" strokeWidth="2" />
                        </svg>
                      </div>
                    </div>
                    <h3>
                      Drag & Drop Your{" "}
                      {uploadType === "video" ? "Video" : "Snip"}
                    </h3>
                    <p>
                      or <span className="browse-text">browse files</span>
                    </p>
                    <div className="supported-formats">
                      <span>
                        {uploadType === "video"
                          ? "MP4, MOV, AVI, MKV up to 2GB"
                          : "MP4, MOV up to 500MB"}
                      </span>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleFileInput}
                    className="file-input"
                  />
                </div>
              ) : (
                <div className={`upload-content ${uploadType === "snip" ? "snip-layout" : ""}`}>
                  <div className="video-preview-section">
                    <div className={`video-preview ${uploadType === "snip" ? "snip-preview" : ""}`}>
                      <video
                        src={previewUrl}
                        controls
                        className={`preview-video ${uploadType === "snip" ? "snip-video" : ""}`}
                      />
                      <div className="file-info">
                        {selectedFile.size > 0 && (
                          <>
                            <span className="file-name">{selectedFile.name}</span>
                            <span className="file-size">
                              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="details-section">
                    <div className="form-group">
                      <label className="form-label">Title *</label>
                      <input
                        type="text"
                        name="title"
                        value={videoDetails.title}
                        onChange={handleInputChange}
                        placeholder={`Give your ${uploadType} a catchy title`}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea
                        name="description"
                        value={videoDetails.description}
                        onChange={handleInputChange}
                        placeholder="Tell viewers about your content"
                        className="form-textarea"
                        rows="4"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Category</label>
                        <select
                          name="category"
                          value={videoDetails.category}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="Education">Education</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="Music">Music</option>
                          <option value="Gaming">Gaming</option>
                          <option value="News">News & Politics</option>
                          <option value="Sports">Sports</option>
                          <option value="Technology">Technology</option>
                          <option value="Travel">Travel & Events</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Visibility</label>
                        <select
                          name="visibility"
                          value={videoDetails.visibility}
                          onChange={handleInputChange}
                          className="form-select"
                        >
                          <option value="public">🌍 Public</option>
                          <option value="unlisted">🔗 Unlisted</option>
                          <option value="private">🔒 Private</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Tags</label>
                      <input
                        type="text"
                        name="tags"
                        value={videoDetails.tags}
                        onChange={handleInputChange}
                        placeholder="Add tags separated by commas"
                        className="form-input"
                      />
                    </div>
                    {uploadType === "video" && (
                      <div className="thumbnail-section">
                        <label className="form-label">Custom Thumbnail</label>
                        <div className="thumbnail-upload">
                          <button
                            type="button"
                            onClick={() => thumbnailInputRef.current?.click()}
                            className="thumbnail-btn"
                          >
                            📷 Upload Thumbnail
                          </button>
                          <input
                            ref={thumbnailInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailSelect}
                            className="file-input"
                          />
                          {videoDetails.thumbnail && (
                            <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
                              ✓ Thumbnail selected: {videoDetails.thumbnail.name}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedFile && (
                <div className="upload-actions">
                  {isUploading ? (
                    <div className="upload-progress">
                      <div className="progress-info">
                        <span>Uploading... {Math.round(uploadProgress)}%</span>
                        <span className="progress-time">
                          Processing your {uploadType}
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="action-buttons">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(null);
                          setVideoDetails({
                            title: "",
                            description: "",
                            tags: "",
                            category: "Education",
                            visibility: "public",
                            thumbnail: null,
                          });
                        }}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      {/* DRAFT BUTTON */}
                      <button
                        type="button"
                        className="btn-tertiary"
                        onClick={() => handleUploadWithDraft(true)}
                        disabled={!videoDetails.title}
                        style={{ marginRight: "12px" }}
                      >
                        💾 Save as Draft
                      </button>
                      {/* PUBLISH BUTTON */}
                      <button
                        type="submit"
                        className="btn-primary"
                        disabled={!videoDetails.title}
                      >
                        🚀 Publish {uploadType === "video" ? "Video" : "Snip"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </form>
          )}

          {uploadType && !selectedFile && (
            <div className="back-button-container">
              <button onClick={resetUploadType} className="back-button">
                ← Back
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UploadVideo;
