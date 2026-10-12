import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const ResetPasswordModal = ({ isOpen, onClose }) => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (isOpen && !token) {
      setMessage({ type: 'error', text: 'Invalid or missing reset token. Please request a new link.' });
    }
  }, [isOpen, token]);

  const handleChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' });
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/auth/reset-password', {
        token: token,
        newPassword: passwords.newPassword
      });

      setMessage({ type: 'success', text: 'Password reset successful! Redirecting to login...' });
      setTimeout(() => {
        onClose();
        navigate('/login?reset=success');
      }, 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to reset password. The link may have expired.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-backdrop"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-[480px] rounded-[2rem] p-10 shadow-2xl animate-modal text-center">
        <button 
          onClick={onClose}
          className="absolute top-6 right-8 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="mb-10">
          <div className="w-16 h-16 bg-[#e9f2ee] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[#2c4d3f] text-3xl">lock_reset</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 font-headline mb-2">New Password</h2>
          <p className="text-gray-500 font-medium">Please enter your new password to secure your account.</p>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-semibold border italic ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
          }`}>
            {message.text}
          </div>
        )}

        {!token ? (
          <div className="mt-4">
             <button onClick={onClose} className="text-gray-900 font-bold hover:underline">Close and go back</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left ml-1 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="At least 6 characters"
                  value={passwords.newPassword}
                  onChange={handleChange}
                  required
                  disabled={message.type === 'success'}
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

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left ml-1 mb-2">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm your password"
                value={passwords.confirmPassword}
                onChange={handleChange}
                required
                disabled={message.type === 'success'}
                className="w-full bg-[#f8fafa] border border-gray-200/50 rounded-2xl px-6 py-4 text-gray-700 placeholder-gray-300 focus:ring-2 focus:ring-[#2c4d3f]/20 focus:border-[#2c4d3f]/30 transition-all outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || message.type === 'success'}
              className="w-full bg-[#1b3d2f] text-white font-bold py-5 rounded-2xl hover:bg-[#152e24] transition-all shadow-lg active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordModal;
