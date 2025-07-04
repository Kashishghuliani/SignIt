import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL || 'https://signit-backend-js8l.onrender.com';

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!email.trim() || !password.trim() || (isSignUp && !fullName.trim())) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      const payload = { email, password };
      if (isSignUp) payload.name = fullName;

      const endpoint = isSignUp ? '/api/auth/register' : '/api/auth/login';
      const res = await axios.post(`${API_URL}${endpoint}`, payload);

      if (isSignUp) {
        alert("Account created successfully! Please sign in.");
        setIsSignUp(false);
        // Clear fields after signup
        setEmail('');
        setPassword('');
        setFullName('');
      } else {
        localStorage.setItem('token', res.data.token);
        alert("Logged In Successfully!");
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error occurred. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
      <div className="flex w-[900px] h-[500px] bg-white rounded-lg shadow-2xl overflow-hidden">
        
        {/* Left Section (Form) */}
        <div className="w-1/2 flex flex-col items-center justify-center px-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            {isSignUp ? "Create Account" : "Sign In"}
          </h2>

          <div className="flex gap-4 mb-6">
            <GoogleLogin
  onSuccess={async (credentialResponse) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/google`, {
        credential: credentialResponse.credential
      });
      localStorage.setItem('token', res.data.token);
      alert("Google Login Successful!");
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert("Google Login Failed");
    }
  }}
  onError={() => alert("Google Login Failed")}
/>

          </div>

          <p className="text-gray-400 text-sm mb-6">or use your email account</p>

          <form onSubmit={handleSubmit} className="w-full space-y-4" noValidate>
            {isSignUp && (
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
                required
              />
            )}

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
              required
            />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
              required
              minLength={6}
              title="Password must be at least 6 characters"
            />

            {!isSignUp && (
              <div className="flex justify-between text-sm text-gray-500">
                <label>
                  <input type="checkbox" className="mr-2" /> Remember me
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot')}
                  className="text-red-500 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded transition"
            >
              {isSignUp ? "Sign Up" : "Sign In"}
            </button>
          </form>
        </div>

        {/* Right Section */}
        <div className="w-1/2 flex flex-col items-center justify-center bg-gradient-to-r from-red-400 to-red-600 text-white text-center p-10">
          <h2 className="text-3xl font-bold mb-4">
            {isSignUp ? "Welcome to SignIt!" : "SignIt"}
          </h2>
          <p className="mb-6">
            {isSignUp
              ? "Already have an account? Sign in to continue signing documents."
              : "Enter your details and start your document signing journey."}
          </p>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="border border-white px-6 py-2 rounded hover:bg-white hover:text-red-500 transition"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
