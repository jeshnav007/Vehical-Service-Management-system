import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';

const Profile = () => {
  const { userInfo, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name || '');
      setEmail(userInfo.email || '');
      setPhone(userInfo.phone || '');
      setAddress(userInfo.address || '');
    }
  }, [userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (showPasswordSection) {
      if (!oldPassword) return toast.error('Current password is required to change password');
      if (password !== confirmPassword) return toast.error('Passwords do not match');
      if (password.length < 6) return toast.error('New password must be at least 6 characters');
    }

    try {
      const updateData = {
        name,
        email,
        phone,
        address,
      };

      if (showPasswordSection && password) {
        updateData.password = password;
        updateData.oldPassword = oldPassword;
      }

      await dispatch(updateProfile(updateData)).unwrap();
      toast.success('Profile updated successfully!');
      
      // Reset password fields
      setPassword('');
      setConfirmPassword('');
      setOldPassword('');
      setShowPasswordSection(false);
    } catch (err) {
      toast.error(err || 'Failed to update profile');
    }
  };

  return (
    <div className="flex justify-center p-4 md:p-8 min-h-[80vh] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="glass w-full max-w-2xl p-6 md:p-10 rounded-3xl shadow-2xl border border-white/10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-3xl font-bold text-white mx-auto mb-4 shadow-lg shadow-primary/20">
            {name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Account Settings</h2>
          <span className="inline-block px-4 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium text-slate-500 dark:text-slate-400 mt-2">
            {userInfo?.role}
          </span>
        </div>

        <form onSubmit={submitHandler} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Full Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Email Address</label>
              <input
                type="email"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Phone Number</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Address</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <button 
              type="button" 
              className="text-primary hover:text-primary-focus font-medium text-sm transition-colors" 
              onClick={() => setShowPasswordSection(!showPasswordSection)}
            >
              {showPasswordSection ? 'Cancel Password Change' : 'Change Password?'}
            </button>

            {showPasswordSection && (
              <div className="mt-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Verify current password"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-500 dark:text-slate-400">Confirm Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-primary hover:bg-primary-focus text-white font-bold rounded-2xl shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none" 
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating Profile...
              </span>
            ) : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
