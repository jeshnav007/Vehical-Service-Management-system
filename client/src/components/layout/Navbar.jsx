import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../redux/slices/authSlice';
import { SunIcon, MoonIcon, LogoutIcon, MenuIcon, UserIcon } from '../../utils/Icons';

const Navbar = ({ toggleSidebar }) => {
  const [isDark, setIsDark] = useState(false);
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Sync with localStorage on mount
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const logoutHandler = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 w-full h-16 glass border-none rounded-none shadow-sm flex items-center justify-between px-6 transition-all duration-300">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar} 
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg lg:hidden transition-colors"
        >
          <MenuIcon className="w-6 h-6 text-slate-600 dark:text-slate-400" />
        </button>
        <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hidden sm:block">
          VSM Platform
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 text-slate-600 dark:text-slate-400 active:scale-90"
          title="Toggle Theme"
        >
          {isDark ? <SunIcon className="w-5 h-5 text-amber-400" /> : <MoonIcon className="w-5 h-5 text-indigo-500" />}
        </button>
        
        {/* Profile Link */}
        <button 
          onClick={() => navigate('/profile')}
          className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 text-slate-600 dark:text-slate-400 active:scale-90"
          title="My Profile"
        >
          <UserIcon className="w-5 h-5 text-primary" />
        </button>

        {/* User Profile / Logout */}
        {userInfo && (
          <div className="flex items-center gap-4 pl-4 border-l border-slate-200 dark:border-slate-700">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-semibold truncate max-w-[150px]">{userInfo.name}</span>
              <span className="text-xs text-slate-500 font-medium">{userInfo.role}</span>
            </div>
            <button 
              onClick={logoutHandler}
              className="p-2.5 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl text-rose-500 transition-all duration-300 active:scale-90"
              title="Logout"
            >
              <LogoutIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
