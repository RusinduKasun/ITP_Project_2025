import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaPaperPlane } from "react-icons/fa";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const apiBase =
        baseUrl.replace(/\/+$/, "") +
        (baseUrl.endsWith("/api") ? "" : "/api");

      const res = await fetch(`${apiBase}/users/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ OTP sent to your email.");
        navigate("/reset-password", { state: { email } });
      } else {
        setError(data.message || "❌ Error sending OTP.");
      }
    } catch (err) {
      console.error("Forgot Password error:", err);
      setError("⚠️ Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 
                    bg-gradient-to-br from-green-50 via-emerald-100 to-lime-200">
      <div className="max-w-md w-full">
        <div className="p-8 bg-white/95 backdrop-blur-lg shadow-2xl rounded-2xl border border-green-200">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
              <FaEnvelope className="text-green-700 text-2xl" />
            </div>
            <h2 className="text-3xl font-bold text-green-900">
              Forgot Password?
            </h2>
            <p className="text-green-700 mt-2">
              Enter your registered email to receive an OTP
            </p>
          </div>

          {/* Messages */}
          {message && (
            <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {message}
            </div>
          )}
          {error && (
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {/* Forgot Password Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-green-900 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-green-500">
                  <FaEnvelope />
                </span>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:outline-none transition"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-lg font-semibold rounded-lg bg-green-700 text-white hover:bg-green-800 active:scale-95 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "Sending..." : <>Send OTP <FaPaperPlane /></>}
            </button>
          </form>

          {/* Extra Links */}
          <div className="flex justify-between items-center mt-6 text-sm">
            <Link to="/login" className="text-green-700 hover:text-green-900">
              Back to Login
            </Link>
            <Link to="/register" className="text-green-700 hover:text-green-900 font-medium">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
