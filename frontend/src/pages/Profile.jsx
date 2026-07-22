import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import authService from '../services/authService';
import {
  Camera, CheckCircle, XCircle, Eye, EyeOff,
  Loader2, User, Mail, Shield, Trash2, Upload
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:5000';

// ─── Toast ────────────────────────────────────────────────────
const Toast = ({ toasts }) => (
  <div className="fixed top-5 right-5 z-50 space-y-2 pointer-events-none">
    {toasts.map(t => (
      <div
        key={t.id}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white pointer-events-auto
          ${t.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}
        style={{ animation: 'slideIn 0.25s ease-out' }}
      >
        {t.type === 'success'
          ? <CheckCircle size={16} className="shrink-0" />
          : <XCircle size={16} className="shrink-0" />}
        {t.message}
      </div>
    ))}
  </div>
);

// ─── Avatar display ───────────────────────────────────────────
const AvatarDisplay = ({ user, previewUrl, size = 'lg' }) => {
  const dim = size === 'lg' ? 'w-24 h-24 text-4xl' : 'w-10 h-10 text-lg';
  const src = previewUrl || (user?.avatar ? `${API_BASE}${user.avatar}` : null);
  if (src) {
    return (
      <img
        src={src}
        alt="avatar"
        className={`${dim} rounded-full object-cover border-4 border-white shadow-md`}
      />
    );
  }
  return (
    <div className={`${dim} rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border-4 border-white shadow-md`}>
      {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
    </div>
  );
};

// ─── Main Profile page ────────────────────────────────────────
const Profile = () => {
  const { currentUser, updateCurrentUser } = useContext(AuthContext);

  // Profile form
  const [fullName, setFullName]         = useState(currentUser?.fullName || '');
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent]   = useState(false);
  const [showNew, setShowNew]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Avatar
  const [previewUrl, setPreviewUrl]     = useState(null);
  const [pendingFile, setPendingFile]   = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Toast
  const [toasts, setToasts] = useState([]);

  // Sync name if user loads after mount
  useEffect(() => {
    if (currentUser?.fullName) setFullName(currentUser.fullName);
  }, [currentUser?.fullName]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  // ── Avatar: open picker ──────────────────────────────────────
  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      addToast('Only .jpg, .jpeg, .png, .webp files are allowed.', 'error');
      e.target.value = '';
      return;
    }
    // Validate size (2 MB)
    if (file.size > 2 * 1024 * 1024) {
      addToast('File too large. Maximum size is 2 MB.', 'error');
      e.target.value = '';
      return;
    }

    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleCancelPreview = () => {
    setPreviewUrl(null);
    setPendingFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadAvatar = async () => {
    if (!pendingFile) return;
    setAvatarLoading(true);
    try {
      const data = await authService.uploadAvatar(pendingFile);
      updateCurrentUser({ avatar: data.avatar });
      // Keep showing the preview (it matches what was uploaded)
      setPendingFile(null);
      // Update preview to point to server URL so it persists after re-render
      setPreviewUrl(`${API_BASE}${data.avatar}?t=${Date.now()}`);
      addToast('Avatar uploaded successfully!');
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to upload avatar.', 'error');
    } finally {
      setAvatarLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── Profile: save name ───────────────────────────────────────
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      addToast('Full name cannot be empty.', 'error');
      return;
    }
    setProfileLoading(true);
    try {
      const data = await authService.updateProfile({ fullName: fullName.trim() });
      updateCurrentUser({ fullName: data.fullName });
      addToast('Profile updated successfully!');
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Password: update ─────────────────────────────────────────
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      addToast('New password must be at least 8 characters.', 'error');
      return;
    }
    setPasswordLoading(true);
    try {
      await authService.updateProfile({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addToast('Password changed successfully!');
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to update password.', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  // ── Member since ─────────────────────────────────────────────
  const memberSince = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'N/A';

  return (
    <>
      {/* Global toast */}
      <Toast toasts={toasts} />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="max-w-4xl mx-auto space-y-6 pb-10">

        {/* Page header */}
        <div className="bg-white p-6 rounded-2xl shadow-soft border border-borderMain">
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your profile information and security.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ── Left: Avatar card ── */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-borderMain flex flex-col items-center text-center">

              {/* Avatar */}
              <div className="relative mb-4">
                <AvatarDisplay user={currentUser} previewUrl={previewUrl} />
                <button
                  onClick={handlePickFile}
                  title="Change avatar"
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition"
                >
                  <Camera size={14} />
                </button>
              </div>

              <h2 className="text-xl font-bold text-gray-900">{currentUser?.fullName || 'User'}</h2>
              <p className="text-gray-500 text-sm">{currentUser?.email || ''}</p>
              <span className="mt-2 text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                {currentUser?.role || 'user'}
              </span>
              <p className="text-xs text-gray-400 mt-2">Member since {memberSince}</p>

              {/* Preview action row */}
              {previewUrl && pendingFile ? (
                <div className="mt-4 w-full space-y-2">
                  <p className="text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 truncate">
                    📎 {pendingFile.name} ({(pendingFile.size / 1024).toFixed(0)} KB)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCancelPreview}
                      className="flex-1 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1 transition"
                    >
                      <Trash2 size={13} /> Cancel
                    </button>
                    <button
                      onClick={handleUploadAvatar}
                      disabled={avatarLoading}
                      className="flex-1 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-1 disabled:opacity-70 transition"
                    >
                      {avatarLoading
                        ? <><Loader2 size={13} className="animate-spin" /> Uploading…</>
                        : <><Upload size={13} /> Upload</>}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handlePickFile}
                  className="mt-5 w-full py-2.5 border-2 border-dashed border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:border-primary/40 hover:text-primary hover:bg-blue-50/30 flex items-center justify-center gap-2 transition"
                >
                  <Camera size={15} /> Upload Avatar
                </button>
              )}
            </div>

            {/* Info card */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-xs text-blue-700 space-y-1">
              <p className="font-bold mb-1">Avatar Guidelines</p>
              <p>• Formats: JPG, PNG, WEBP</p>
              <p>• Max size: 2 MB</p>
              <p>• Recommended: square image</p>
              <p>• Changes save permanently</p>
            </div>
          </div>

          {/* ── Right: Forms ── */}
          <div className="md:col-span-2 space-y-6">

            {/* Profile Information */}
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-borderMain">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                <User size={17} className="text-primary" /> Profile Information
              </h3>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-4 py-2.5 rounded-xl border border-borderMain focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={currentUser?.email || ''}
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Email address cannot be changed.</p>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm disabled:opacity-70 flex items-center gap-2"
                  >
                    {profileLoading
                      ? <><Loader2 size={15} className="animate-spin" /> Saving…</>
                      : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Security */}
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-borderMain">
              <h3 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                <Shield size={17} className="text-primary" /> Security
              </h3>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {/* Current password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      required
                      placeholder="Enter current password"
                      className="w-full px-4 py-2.5 pr-11 rounded-xl border border-borderMain focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(p => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* New + confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showNew ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        required
                        placeholder="Min 8 characters"
                        className="w-full px-4 py-2.5 pr-11 rounded-xl border border-borderMain focus:outline-none focus:ring-2 focus:ring-primary/20 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(p => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        placeholder="Repeat new password"
                        className={`w-full px-4 py-2.5 pr-11 rounded-xl border focus:outline-none focus:ring-2 focus:ring-primary/20 transition
                          ${confirmPassword && newPassword !== confirmPassword
                            ? 'border-red-300 bg-red-50'
                            : 'border-borderMain'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(p => !p)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">Passwords do not match.</p>
                    )}
                  </div>
                </div>

                {/* Strength hint */}
                {newPassword && (
                  <div className="flex gap-1 items-center">
                    {[1,2,3,4].map(n => (
                      <div key={n} className={`h-1.5 flex-1 rounded-full transition-colors ${
                        newPassword.length >= n * 3
                          ? n <= 2 ? 'bg-red-400' : n === 3 ? 'bg-yellow-400' : 'bg-green-500'
                          : 'bg-gray-100'
                      }`} />
                    ))}
                    <span className="text-xs text-gray-400 ml-2">
                      {newPassword.length < 8 ? 'Too short' : newPassword.length < 10 ? 'Weak' : newPassword.length < 12 ? 'Good' : 'Strong'}
                    </span>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={passwordLoading || (confirmPassword !== '' && newPassword !== confirmPassword)}
                    className="px-6 py-2.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition shadow-sm disabled:opacity-60 flex items-center gap-2"
                  >
                    {passwordLoading
                      ? <><Loader2 size={15} className="animate-spin" /> Updating…</>
                      : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>

            {/* Danger zone */}
            <div className="bg-white p-6 rounded-2xl shadow-soft border border-red-100">
              <h3 className="text-lg font-bold text-red-600 mb-2 flex items-center gap-2">
                <XCircle size={17} /> Danger Zone
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button
                type="button"
                onClick={() => addToast('Account deletion is disabled in this environment.', 'error')}
                className="px-5 py-2 border-2 border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition"
              >
                Delete Account
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
