import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const API_URL = 'https://signit-backend-js8l.onrender.com';  // Use your deployed backend

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
      setTimeout(() => navigate('/'), 2000);  // Redirect to login after success
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Error resetting password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
      <div className="flex w-[800px] h-[400px] bg-white rounded-lg shadow-2xl overflow-hidden">
        
        {/* Left Side */}
        <div className="w-1/2 flex flex-col items-center justify-center px-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Reset Your Password</h2>

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

          {message && <p className="mt-4 text-sm text-red-500">{message}</p>}
        </div>

        {/* Right Side */}
        <div className="w-1/2 flex flex-col items-center justify-center bg-gradient-to-r from-red-400 to-red-600 text-white text-center p-10">
          <h2 className="text-3xl font-bold mb-4">SignIt - Secure Your Account</h2>
          <p>Reset your password and regain access securely.</p>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;
