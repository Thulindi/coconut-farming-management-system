import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api';
import { Link } from 'react-router-dom';

const DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha',
  'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala',
  'Mannar', 'Matale', 'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya',
];

const InfoField = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{label}</p>
    <p className="font-semibold text-slate-800 text-[15px]">{value || <span className="text-slate-300 italic">Not set</span>}</p>
  </div>
);

const Profile = () => {
  const { user, hasRole } = useAuth();
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    officerId: '',
    fullName: '',
    profilePhoto: '',
    district: '',
    phone: '',
    department: '',
    designation: '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const { logout } = useAuth();

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  const isOfficer = hasRole('OFFICER');
  const isAdmin = hasRole('ADMIN');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authAPI.getProfile(user.username);
        setProfile((prev) => ({ ...prev, ...response.data }));
      } catch (error) {
        console.error('Error fetching profile:', error);
        setMessage({ type: 'error', text: 'Failed to load profile data.' });
      } finally {
        setLoading(false);
      }
    };

    if (user?.username) {
      fetchProfile();
    }
  }, [user?.username]);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      let updatedProfile = { ...profile };

      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadRes = await authAPI.uploadPhoto(user.username, formData);
        updatedProfile.profilePhoto = uploadRes.data;
      }

      await authAPI.updateProfile(user.username, updatedProfile);

      setProfile(updatedProfile);
      setSelectedFile(null);
      setPreviewPhoto(null);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: (error.response?.data?.message || 'Failed to update profile.') });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    // Frontend Validations
    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    if (!specialCharRegex.test(passwordForm.newPassword)) {
      setPasswordMessage({ type: 'error', text: 'New password must contain at least one special character.' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setPasswordSaving(true);
    try {
      // Use absolute path explicitly to prevent any baseURL recursion
      await authAPI.changePassword(user.username, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      setPasswordMessage({ type: 'success', text: 'Password changed successfully! Logging out in 2 seconds...' });

      // Clear form
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });

      // Forced logout after 2 seconds
      setTimeout(() => {
        logout();
      }, 2000);

    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordMessage({
        type: 'error',
        text: typeof error.response?.data === 'string' ? error.response.data : 'Failed to change password. Please check your current password.'
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10 animate-fade-in">
        <span className="material-symbols-outlined text-4xl text-slate-300 animate-spin">autorenew</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10 animate-fade-in">

      {/* Back Link */}
      <Link
        to="/dashboard"
        className="flex items-center space-x-2 text-[10px] font-bold text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-[0.2em] mb-4 group"
      >
        <span className="material-symbols-outlined text-[14px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
        <span>Back to Dashboard</span>
      </Link>

      {/* Page Title is in Layout header */}


      {message.text && (
        <div className={`p-4 rounded-xl animate-fade-in flex items-center space-x-3 border ${message.type === 'success'
            ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
            : 'bg-rose-50 border-rose-100 text-rose-700'
          }`}>
          <span className="material-symbols-outlined">
            {message.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="text-sm font-bold">{message.text}</span>
          <button onClick={() => setMessage({ type: '', text: '' })} className="ml-auto material-symbols-outlined text-[18px]">close</button>
        </div>
      )}

      {/* Profile Card Main Content */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 sm:p-8">

        {/* Avatar & Header Info */}
        <div className="flex items-center space-x-6 mb-8">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-slate-50 shadow-sm overflow-hidden bg-slate-100">
              {(previewPhoto || profile.profilePhoto) ? (
                <img src={previewPhoto || profile.profilePhoto} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-500 text-4xl font-black">
                  {profile.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {isEditing && (
              <label className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-900/60 backdrop-blur-sm text-white rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer border-4 border-transparent">
                <span className="material-symbols-outlined text-2xl">photo_camera</span>
                <input type="file" hidden accept="image/*" onChange={handlePhotoSelect} />
              </label>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight font-headline mb-0.5">
              {profile.fullName || profile.username}
            </h2>
            <p className="text-slate-500 font-medium text-sm">{profile.email}</p>
          </div>
        </div>

        {/* Dynamic Views: Info Grid OR Edit Form */}
        {!isEditing ? (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
              <InfoField label="Username" value={profile.username} />
              <InfoField label="Email Address" value={profile.email} />
              <InfoField label="Full Name" value={profile.fullName} />

              {!isAdmin && <InfoField label="District" value={profile.district} />}
              <InfoField label="Phone Number" value={profile.phone} />

              {isOfficer && (
                <>
                  <InfoField label="Officer ID" value={profile.officerId} />
                  <InfoField label="Department" value={profile.department} />
                  <InfoField label="Designation" value={profile.designation} />
                </>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-all shadow-sm font-bold text-xs uppercase tracking-wider"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                <span>Edit Profile</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">

              {/* Readonly username and email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Username</label>
                <input type="text" disabled value={profile.username} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-400 cursor-not-allowed" />
                <p className="text-[10px] text-slate-400">Cannot be changed</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Email</label>
                <input type="text" disabled value={profile.email} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-400 cursor-not-allowed" />
                <p className="text-[10px] text-slate-400">Cannot be changed</p>
              </div>

              {/* Editable Fields */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Full Name</label>
                <input
                  name="fullName"
                  value={profile.fullName || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all shadow-sm"
                />
              </div>

              {!isAdmin && (
                <div className="space-y-1.5 relative">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">District</label>
                  <select
                    name="district"
                    value={profile.district || ''}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="">Select a District</option>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-[32px] text-slate-400 pointer-events-none text-[20px]">expand_more</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Phone Number</label>
                <input
                  name="phone"
                  value={profile.phone || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all shadow-sm"
                />
              </div>

              {isOfficer && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Department</label>
                    <input
                      name="department"
                      value={profile.department || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all shadow-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Designation</label>
                    <input
                      name="designation"
                      value={profile.designation || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all shadow-sm"
                    />
                  </div>
                </>
              )}

            </div>

            <div className="flex items-center gap-3 mt-8 pt-6 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-full transition-all shadow-sm font-bold text-xs uppercase tracking-wider"
              >
                {saving ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    <span>Save Changes</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedFile(null);
                  setPreviewPhoto(null);
                }}
                className="px-6 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-full font-bold text-xs uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Security Settings Card */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm p-6 sm:p-8">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
            <span className="material-symbols-outlined text-rose-500">lock_reset</span>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight font-headline uppercase">Security Settings</h2>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider">Update your account password</p>
          </div>
        </div>

        {passwordMessage.text && (
          <div className={`p-4 rounded-xl mb-8 animate-fade-in flex items-center space-x-3 border ${passwordMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
              : 'bg-rose-50 border-rose-100 text-rose-700'
            }`}>
            <span className="material-symbols-outlined">
              {passwordMessage.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span className="text-sm font-bold">{passwordMessage.text}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-6 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Current Password *</label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all shadow-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-all p-1"
                >
                  <span className="material-symbols-outlined text-[20px] select-none">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>
            <div className="hidden sm:block"></div> {/* Spacer */}

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">New Password *</label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all shadow-sm"
                  placeholder="Min 6 chars + symbol"
                />
              </div>
              <p className="text-[9px] text-slate-400 font-medium ml-1">Must be 6+ characters with at least one special character.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase ml-1">Confirm New Password *</label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all shadow-sm"
                  placeholder="Confirm new password"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={passwordSaving}
              className="flex items-center space-x-2 px-8 py-3 bg-slate-900 hover:bg-black disabled:bg-slate-400 text-white rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-bold text-xs uppercase tracking-wider"
            >
              {passwordSaving ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  <span>Updating Security...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">security</span>
                  <span>Update Password</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
