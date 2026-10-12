import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister, successMessage, onClearMessage, onForgotPassword }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle({ tokenId: credentialResponse.credential });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Google Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError('');
    if (onClearMessage) onClearMessage();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(credentials);
      onClose();
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data || err.message || 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-backdrop"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-[480px] rounded-[2rem] p-10 shadow-2xl animate-modal">
        <button 
          onClick={onClose}
          className="absolute top-6 right-8 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#e9f2ee] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[#2c4d3f] text-3xl">login</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 font-headline mb-2">Welcome Back</h2>
          <p className="text-gray-500 font-medium">Login to your dashboard</p>
        </div>

        {successMessage?.text && (
          <div className="p-4 rounded-xl mb-6 text-sm font-semibold border italic bg-emerald-50 text-emerald-600 border-emerald-100">
            {successMessage.text}
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-semibold border border-red-100 italic">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={credentials.email}
              onChange={handleChange}
              required
              className="w-full bg-[#f8fafa] border border-gray-200/50 rounded-2xl px-6 py-4 text-gray-700 placeholder-gray-300 focus:ring-2 focus:ring-[#2c4d3f]/20 focus:border-[#2c4d3f]/30 transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1 mb-2">Password</label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-[#f8fafa] border border-gray-200/50 rounded-2xl px-6 py-4 text-gray-700 placeholder-gray-300 focus:ring-2 focus:ring-[#2c4d3f]/20 focus:border-[#2c4d3f]/30 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2c4d3f] transition-all p-1"
                >
                  <span className="material-symbols-outlined text-[20px] select-none">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
          </div>

          <div className="text-right">
            <button 
              type="button"
              onClick={onForgotPassword}
              className="text-xs font-bold text-gray-900 hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1b3d2f] text-white font-bold py-5 rounded-2xl hover:bg-[#152e24] transition-all shadow-lg active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              'Login Now'
            )}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-400 font-medium">Or continue with</span>
          </div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google Login Failed')}
            useOneTap
            theme="outline"
            shape="pill"
            width="100%"
            locale="en"
          />
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm font-medium text-gray-500">
            Don't have an account?{' '}
            <button 
              onClick={onSwitchToRegister}
              className="text-gray-900 font-bold hover:underline"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
