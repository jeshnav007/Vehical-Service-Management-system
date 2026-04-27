import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  HomeIcon, 
  TruckIcon, 
  CalendarIcon, 
  UsersIcon, 
  WrenchIcon, 
  CreditCardIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  UserIcon
} from '../../utils/Icons';

const Sidebar = ({ isCollapsed, toggleCollapse, isMobile, closeMobile }) => {
  const { userInfo } = useSelector((state) => state.auth);

  if (!userInfo) return null;

  const links = {
    Customer: [
      { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
      { name: 'My Garage', path: '/dashboard', icon: TruckIcon }, // Same page, different section usually
      { name: 'Book Service', path: '/book-service', icon: CalendarIcon },
      { name: 'Payments', path: '/payments', icon: CreditCardIcon },
      { name: 'My Profile', path: '/profile', icon: UserIcon },
    ],
    Technician: [
      { name: 'My Dashboard', path: '/technician', icon: HomeIcon },
      { name: 'Assigned Jobs', path: '/technician', icon: WrenchIcon },
      { name: 'My Profile', path: '/profile', icon: UserIcon },
    ],
    ServiceCenter: [
      { name: 'Center Overview', path: '/service-center', icon: HomeIcon },
      { name: 'Appointments', path: '/service-center', icon: CalendarIcon },
      { name: 'My Profile', path: '/profile', icon: UserIcon },
    ],
    Admin: [
      { name: 'Admin Home', path: '/admin', icon: HomeIcon },
      { name: 'User Registry', path: '/admin', icon: UsersIcon },
      { name: 'My Profile', path: '/profile', icon: UserIcon },
    ],
  };

  const currentLinks = links[userInfo.role] || [];

  const NavItem = ({ link }) => (
    <NavLink
      to={link.path}
      onClick={isMobile ? closeMobile : undefined}
      className={({ isActive }) => `
        flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
        ${isActive 
          ? 'bg-primary text-white shadow-lg shadow-primary/30' 
          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}
      `}
    >
      <link.icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 group-hover:scale-110`} />
      {!isCollapsed && <span className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">{link.name}</span>}
    </NavLink>
  );

  return (
    <aside className={`
      fixed lg:static inset-y-0 left-0 z-50
      bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
      transition-all duration-300 ease-in-out
      ${isCollapsed ? 'w-20' : 'w-64'}
      ${isMobile ? (closeMobile ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
    `}>
      {/* Branding / Collapse Toggle */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
        {!isCollapsed && <span className="text-xl font-bold text-primary italic">VSM</span>}
        <button 
          onClick={toggleCollapse} 
          className="hidden lg:block p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
        >
          {isCollapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="p-4 flex flex-col gap-2">
        {currentLinks.map((link, idx) => (
          <NavItem key={idx} link={link} />
        ))}
      </nav>

      {/* Footer Branding (Icon only when collapsed) */}
      <div className="absolute bottom-6 w-full px-6 pointer-events-none opacity-40">
         {!isCollapsed ? (
           <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">© 2026 VSM Cloud</p>
         ) : (
           <div className="w-2 h-2 bg-primary rounded-full mx-auto animate-pulse" />
         )}
      </div>
    </aside>
  );
};

export default Sidebar;
