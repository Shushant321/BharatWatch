import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const e = params.get("email");
    if (e) setEmail(e);
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!code || code.length !== 7) {
      setError("Please enter the 7-digit code from your email");
      return;
    }

    setLoading(true);
    try {
      const res = await api.verifyEmail(email, code);
      setMessage(res.message || "Email verified successfully");
      // chaho to thodi der baad login pe
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>BharatWatch</h1>
          <h2>Verify your email</h2>
          <p>We have sent a 7-digit code to {email || "your email"}.</p>
        </div>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <input
              type="text"
              name="code"
              placeholder="Enter 7-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={7}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-btn primary"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;
