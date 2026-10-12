import React, { useState } from 'react';
import axios from 'axios';

const ForgotPasswordModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.post(`http://localhost:8080/api/auth/forgot-password?email=${email}`);
      setMessage({
        type: 'success',
        text: 'A reset link has been sent to your email. Please check your inbox.'
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to send reset link.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
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
            <span className="material-symbols-outlined text-[#2c4d3f] text-3xl">mark_email_read</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 font-headline mb-2">Forgot Password?</h2>
          <p className="text-gray-500 font-medium">No worries! Enter your email and we'll send you a link to reset your password.</p>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-semibold border italic ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left ml-1 mb-2">Email Address</label>
            <input
              type="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              'Send Reset Link'
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-sm font-medium text-gray-500">
            Remembered your password?{' '}
            <button 
              onClick={onSwitchToLogin}
              className="text-gray-900 font-bold hover:underline"
            >
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
