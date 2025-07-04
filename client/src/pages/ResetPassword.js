import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/api/auth/reset-password`, {
        token,
        newPassword
      });
      setMessage(res.data.message || "Password reset successful!");
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Error resetting password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4">
      <div className="flex flex-col md:flex-row w-full max-w-3xl bg-white rounded-lg shadow-2xl overflow-hidden">

        {/* Left Side */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center px-6 md:px-10 py-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 text-center">Reset Your Password</h2>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
            />

            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
            />

            <button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded transition"
            >
              Reset Password
            </button>
          </form>

          {message && <p className="mt-4 text-sm text-red-500 text-center">{message}</p>}
        </div>

        {/* Right Side */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-gradient-to-r from-red-400 to-red-600 text-white text-center p-6 md:p-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">SignIt - Secure Your Account</h2>
          <p className="text-sm md:text-base">Reset your password and regain access securely.</p>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;
