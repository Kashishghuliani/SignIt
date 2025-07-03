import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return alert("Please enter your email");

    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      alert(res.data.message || "Password reset link sent to your email!");
      navigate('/');
    } catch (err) {
      console.error(err);
      alert("Failed to send reset link. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
      <div className="flex w-[800px] h-[400px] bg-white rounded-lg shadow-2xl overflow-hidden">

        {/* Left Side */}
        <div className="w-1/2 flex flex-col items-center justify-center px-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Forgot Password?</h2>
          <p className="text-gray-500 text-sm mb-6 text-center">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
            />

            <button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded transition"
            >
              Send Reset Link
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-500">
            Remembered your password?{' '}
            <button
              onClick={() => navigate('/')}
              className="text-red-500 hover:underline"
            >
              Back to Login
            </button>
          </p>
        </div>

        {/* Right Side */}
        <div className="w-1/2 flex flex-col items-center justify-center bg-gradient-to-r from-red-400 to-red-600 text-white text-center p-10">
          <h2 className="text-3xl font-bold mb-4">Secure Your Account</h2>
          <p>
            Forgot your password? Don't worry! We'll help you get back on track quickly and securely.
          </p>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
