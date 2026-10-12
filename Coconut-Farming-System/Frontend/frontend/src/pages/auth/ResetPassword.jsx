import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (!token) {
      setMessage({ type: 'error', text: 'Invalid or missing reset token. Please request a new link.' });
    }
  }, [token]);

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
      setTimeout(() => navigate('/login?reset=success'), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to reset password. The link may have expired.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden font-body">
      {/* Background Image (Same as Landing Page) */}
      <div className="absolute inset-0 z-0">
        <img 
          className="w-full h-full object-cover scale-105 blur-[2px]" 
          alt="Lush tropical coconut plantation" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCU75pu2vVjEAcqPXYoFlzPoKe7p6eOTqHvrFYvlybCnp_TBsbPprF7Ozjhhk1TKd1ZSZ8bq9LQ0gs6oCugol1pdKld0dUW-tIpGMzcwt5s0jWIBl1fEkNBBFM1SCliEdBzGAr5DtQaka-gXqlJMGxAvVMZEwtqt2JSbZib7SxVS85UQoHSg_oC29a043k3EgKMd4K7IoF7Q6vTDf_zolVoUzcGhbKtaJWcoQazmWXqaxqt28webxpkVSC3Zuzhle190SEhz7wYrz4A"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/80 to-emerald-800/40 backdrop-blur-[1px]"></div>
      </div>

      {/* Modal Style Card */}
      <div className="relative z-10 bg-white w-full max-w-[480px] rounded-[2.5rem] p-10 md:p-12 shadow-2xl animate-modal text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-[#e9f2ee] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[#2c4d3f] text-3xl">lock_reset</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 font-headline mb-2">New Password</h2>
          <p className="text-gray-500 font-medium">Please enter your new password below to secure your account.</p>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-semibold border italic ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'
          }`}>
            {message.text}
          </div>
        )}

        {!token ? (
          <Link 
            to="/" 
            className="inline-block w-full bg-gray-100 text-gray-700 font-bold py-4 rounded-2xl hover:bg-gray-200 transition-all"
          >
            Go to Landing Page
          </Link>
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

        <div className="mt-10 text-center">
          <p className="text-sm font-medium text-gray-500">
            Remembered your password?{' '}
            <Link to="/login" className="text-gray-900 font-bold hover:underline">
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
