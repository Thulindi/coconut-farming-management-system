import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha',
  'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala',
  'Mannar', 'Matale', 'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
];

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    roles: ['FARMER'],
    officerId: '',
    district: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const selectedRole = formData.roles[0];
      
      // Validation: Officer ID is mandatory for Google Signup if role is OFFICER
      if (selectedRole === 'OFFICER' && !formData.officerId.trim()) {
        setMessage({ type: 'error', text: 'Please enter your Officer ID before signing up with Google.' });
        setLoading(false);
        return;
      }

      await loginWithGoogle({ 
        tokenId: credentialResponse.credential,
        role: selectedRole,
        officerId: formData.officerId
      });
      
      onClose();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Google signup failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setMessage({ type: '', text: '' });
  };

  const handleRoleChange = (e) => {
    const role = e.target.value;
    setFormData({
      ...formData,
      roles: [role],
      officerId: role === 'FARMER' ? '' : formData.officerId,
      district: role === 'FARMER' ? '' : formData.district,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    // New Security Validation
    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!specialCharRegex.test(formData.password)) {
      setMessage({ type: 'error', text: 'Password must contain at least one special character.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await register(formData);
      const isFarmer = formData.roles.includes('FARMER');
      const successMsg = isFarmer 
        ? `Registration successful! Please check your email (${formData.email}) to verify your account.`
        : 'Registration successful! Your account is pending Admin approval.';
      
      onRegisterSuccess({ type: 'success', text: successMsg });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data || err.message || 'Registration failed';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isOfficer = formData.roles.includes('OFFICER');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-backdrop"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div 
        className="relative bg-white w-full max-w-[520px] rounded-[2rem] p-10 shadow-2xl animate-modal max-h-[90vh] overflow-y-auto custom-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style dangerouslySetInnerHTML={{ __html: `.custom-scrollbar::-webkit-scrollbar { display: none; }` }} />
        <button 
          onClick={onClose}
          className="absolute top-6 right-8 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#e9f2ee] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[#2c4d3f] text-3xl">person_add</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 font-headline mb-2">Create Your Account</h2>
          <p className="text-gray-500 font-medium text-sm">Join our coconut farming management system</p>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-semibold border italic ${
            message.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Full Name (Username)"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full bg-[#f8fafa] border border-gray-200/50 rounded-2xl px-6 py-4 text-gray-700 placeholder-gray-300 focus:ring-2 focus:ring-[#2c4d3f]/20 focus:border-[#2c4d3f]/30 transition-all outline-none"
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full bg-[#f8fafa] border border-gray-200/50 rounded-2xl px-6 py-4 text-gray-700 placeholder-gray-300 focus:ring-2 focus:ring-[#2c4d3f]/20 focus:border-[#2c4d3f]/30 transition-all outline-none"
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-[#f8fafa] border border-gray-200/50 rounded-2xl px-6 py-4 text-gray-700 placeholder-gray-300 focus:ring-2 focus:ring-[#2c4d3f]/20 focus:border-[#2c4d3f]/30 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#2c4d3f]"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full bg-[#f8fafa] border border-gray-200/50 rounded-2xl px-6 py-4 text-gray-700 placeholder-gray-300 focus:ring-2 focus:ring-[#2c4d3f]/20 focus:border-[#2c4d3f]/30 transition-all outline-none"
              />
            </div>
          </div>
          <p className="text-[10px] text-[#2c4d3f]/50 font-medium px-2">
            Requirement: Min 6 characters + at least one special character (!@#$%^&*)
          </p>

          <select
            value={formData.roles[0]}
            onChange={handleRoleChange}
            className="w-full bg-[#f8fafa] border border-gray-200/50 rounded-2xl px-6 py-4 text-gray-700 focus:ring-2 focus:ring-[#2c4d3f]/20 focus:border-[#2c4d3f]/30 transition-all outline-none appearance-none"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23cbd5e1\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.25rem' }}
          >
            <option value="FARMER">Farmer</option>
            <option value="OFFICER">Agriculture Officer</option>
          </select>

          {isOfficer && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
              <input
                type="text"
                name="officerId"
                placeholder="Officer ID"
                value={formData.officerId}
                onChange={handleChange}
                required
                className="w-full bg-[#f8fafa] border border-gray-200/50 rounded-2xl px-6 py-4 text-gray-700 placeholder-gray-300 focus:ring-2 focus:ring-[#2c4d3f]/20 focus:border-[#2c4d3f]/30 transition-all outline-none"
              />
              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                required
                className="w-full bg-[#f8fafa] border border-gray-200/50 rounded-2xl px-6 py-4 text-gray-700 focus:ring-2 focus:ring-[#2c4d3f]/20 focus:border-[#2c4d3f]/30 transition-all outline-none appearance-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23cbd5e1\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.25rem' }}
              >
                <option value="" disabled>Select District</option>
                {DISTRICTS.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1b3d2f] text-white font-bold py-5 rounded-2xl hover:bg-[#152e24] transition-all shadow-lg active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-400 font-medium italic">Or quickly register with role above</span>
          </div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setMessage({ type: 'error', text: 'Google Signup Failed' })}
            useOneTap
            theme="outline"
            shape="pill"
            width="100%"
            text="signup_with"
            locale="en"
          />
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm font-medium text-gray-500">
            Already have an account?{' '}
            <button 
              onClick={onSwitchToLogin}
              className="text-gray-900 font-bold hover:underline"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
