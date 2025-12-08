import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/navbar";
import Snips from "./components/Snips/Snips";
import SnipsPage from "./components/Snips/SnipsPage";
import Categories from "./components/categories/Categories";
import RecommendedVideos from "./components/VideoCard/RecommendedVideos";
import Downloads from './pages/downloads/Download';
import Login from "./pages/login/logIn";
import Signup from "./pages/login/signup";
import VideoPlayer from "./pages/videoplayer/VideoPlayer";
import Settings from "./pages/Settings/Settings";
import Trending from "./pages/Trending/Trending";
import SavedVideos from "./pages/SavedVideos/SavedVideos";
import Notifications from "./pages/Notifications/Notifications";
import Feedback from "./pages/Feedback/Feedback";
import Help from "./pages/Help/Help";
import ChannelPage from "./pages/Channel/ChannelPage";
import MyChannel from "./pages/myChannel/myChannel";
import UploadVideo from "./pages/Upload/uploadvideo";
import DraftVideos from "./pages/DraftVideos/DraftVideos";
import ZohoCallback from "./pages/auth/ZohoCallback";
import VerifyEmail from "./pages/auth/VerifyEmail";
import SearchResults from "./pages/search/SearchResults";

const App = () => {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('darkMode') === 'true'
  );

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : '';
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  return (
    <Router>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <Routes>
        {/* Home page */}
        <Route path="/" element={
          <div className="app-container">
            <div className="main-content">
              <Snips />
              <Categories />
              <RecommendedVideos />
            </div>
          </div>
        } />
        {/* Show all snips small/preview */}
        <Route path="/snips" element={<Snips />} />
        {/* Show single snip page, arrows, backend connect */}
        <Route path="/snips/:id" element={<SnipsPage />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Optional: repeat home on /home */}
        <Route path="/home" element={
          <div className="app-container">
            <div className="main-content">
              <Snips />
              <Categories />
              <RecommendedVideos />
            </div>
          </div>
        } />
        <Route path="/videoplayer/:id" element={<VideoPlayer darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/downloads" element={<Downloads darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/settings" element={<Settings darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/trending" element={<Trending darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/saved" element={<SavedVideos darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/notifications" element={<Notifications darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/feedback" element={<Feedback darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/help" element={<Help darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/channel/:username" element={<ChannelPage darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/my-channel" element={<MyChannel darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/upload" element={<UploadVideo darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/upload/:draftId" element={<UploadVideo darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/auth/zoho/callback" element={<ZohoCallback />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/drafts" element={<DraftVideos darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/search" element={<SearchResults />} />
      </Routes>
    </Router>
  );
};

export default App;
