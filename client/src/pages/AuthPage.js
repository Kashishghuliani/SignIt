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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans px-4">
      <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg max-w-4xl w-full overflow-hidden">
        
        {/* Left Section */}
        <div className="flex-1 p-8 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center md:text-left">
            {isSignUp ? "Create Account" : "Sign In"}
          </h2>

          <div className="flex justify-center md:justify-start mb-6">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const res = await axios.post(`${API_URL}/api/auth/google`, {
                    credential: credentialResponse.credential,
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

          <p className="text-gray-400 text-sm mb-6 text-center md:text-left">
            or use your email account
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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

          {/* Mobile Toggle Below Form */}
          <div className="block md:hidden mt-4 text-center">
            {isSignUp ? (
              <p className="text-sm">
                Already have an account?{' '}
                <button onClick={() => setIsSignUp(false)} className="text-red-500 underline">
                  Sign In
                </button>
              </p>
            ) : (
              <p className="text-sm">
                Don't have an account?{' '}
                <button onClick={() => setIsSignUp(true)} className="text-red-500 underline">
                  Sign Up
                </button>
              </p>
            )}
          </div>
        </div>

        {/* Right Section Hidden on Mobile */}
        <div className="hidden md:flex flex-1 flex-col justify-center items-center bg-gradient-to-r from-red-500 to-red-700 text-white p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">{isSignUp ? "Welcome to SignIt!" : "SignIt"}</h2>
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
