import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  TruckIcon, 
  CalendarIcon, 
  WrenchIcon, 
  CreditCardIcon, 
  ChevronRightIcon, 
  UsersIcon,
  SunIcon,
  MoonIcon
} from '../utils/Icons';

const Home = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('theme') === 'dark' || 
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    if (userInfo) {
      navigate('/dashboard');
    }
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [userInfo, navigate, isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  return (
    <div className="min-h-screen bg-lightbg dark:bg-darkbg transition-colors duration-300 overflow-x-hidden selection:bg-primary/30 selection:text-primary">
      
      {/* --- PUBLIC NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 backdrop-blur-md bg-white/70 dark:bg-darkbg/70 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="bg-primary p-2.5 rounded-xl shadow-lg shadow-primary/30 group-hover:rotate-12 transition-transform duration-300">
              <TruckIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase whitespace-nowrap">
              VSM<span className="text-primary tracking-normal ml-0.5">Platform</span>
            </span>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:scale-110 transition-transform"
            >
              {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            <div className="hidden sm:flex items-center gap-4">
              <Link to="/login" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">
                Login
              </Link>
              <Link to="/register" className="btn-primary py-2.5 px-6 rounded-xl shadow-lg shadow-primary/20">
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* --- HERO SECTION --- */}
        <section className="relative pt-40 pb-20 px-6 sm:px-12 lg:pt-52 lg:pb-32 overflow-hidden">
          {/* Background Blobs */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-8 animate-fade-in-down">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Revolutionizing Fleet Management
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-8 animate-fade-in-up">
              Vehicle Service <br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Management Platform</span>
            </h1>
            
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Manage your vehicle services, track repairs in real-time, and handle 
              secure payments seamlessly through our premium roles-based gateway.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Link to="/register" className="btn-primary py-4 px-10 rounded-2xl text-lg shadow-2xl shadow-primary/30 flex items-center gap-2 group">
                Get Started Free <ChevronRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="px-10 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                Client Login
              </Link>
            </div>
          </div>
        </section>

        {/* --- FEATURES GRID --- */}
        <section className="py-24 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Enterprise-Grade Features</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Built for transparency, speed, and precision.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { 
                  title: 'Book Services', 
                  desc: 'Schedule maintenance slots directly from your digital garage.', 
                  icon: CalendarIcon, 
                  color: 'text-primary',
                  bg: 'bg-primary/10'
                },
                { 
                  title: 'Track Progress', 
                  desc: 'Real-time updates as your vehicle moves through the repair shop.', 
                  icon: TruckIcon, 
                  color: 'text-accent',
                  bg: 'bg-accent/10'
                },
                { 
                  title: 'Manage Invoices', 
                  desc: 'Automated digital billing with line-item transparency.', 
                  icon: CreditCardIcon, 
                  color: 'text-emerald-500',
                  bg: 'bg-emerald-500/10'
                },
                { 
                  title: 'Get Notifications', 
                  desc: 'Stay informed with instant alerts on status changes.', 
                  icon: WrenchIcon, 
                  color: 'text-amber-500',
                  bg: 'bg-amber-500/10'
                }
              ].map((f, i) => (
                <div key={i} className="glass p-8 group hover:scale-105 transition-all duration-300">
                  <div className={`${f.bg} ${f.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm`}>
                    <f.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">{f.title}</h3>
                  <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- HOW IT WORKS --- */}
        <section className="py-24 px-6 bg-white/50 dark:bg-slate-900/40 border-y border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-8">
                  The Journey From <br />
                  <span className="text-primary italic">Booking to Pavement.</span>
                </h2>
                <div className="space-y-12">
                  {[
                    { step: '01', title: 'Register Vehicle', desc: 'Add your vehicle details once to your secure digital garage.' },
                    { step: '02', title: 'Book Service', desc: 'Pick a date and service type. We handle the routing and oversight.' },
                    { step: '03', title: 'Track Repair', desc: 'Watch your mechanic log labor hours and parts usage in real-time.' },
                    { step: '04', title: 'Pay Invoice', desc: 'Finalize billing within the app through our secure gateway.' }
                  ].map((s, i) => (
                    <div key={i} className="flex gap-6 group">
                      <div className="text-4xl font-black text-primary/20 group-hover:text-primary transition-colors duration-300 tracking-tighter">
                        {s.step}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{s.title}</h4>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-primary blur-[100px] opacity-10 animate-pulse" />
                <div className="glass p-10 relative z-10 animate-float border-primary/20">
                  <div className="w-full aspect-[4/3] rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                     <WrenchIcon className="w-32 h-32 text-slate-300 dark:text-slate-700" />
                  </div>
                  <div className="mt-8 space-y-3">
                    <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-full" />
                    <div className="h-3 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- ROLE HIGHLIGHT --- */}
        <section className="py-24 px-6 relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-4">Portals for Everyone</h2>
               <p className="text-slate-500 dark:text-slate-400 font-medium">A specialized workflow tailored for every participant.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { role: 'Customer', use: 'Book repair, pay invoice', icon: UsersIcon },
                { role: 'Technician', use: 'Log labor, manage parts', icon: WrenchIcon },
                { role: 'Service Center', use: 'Assign tech, generate bills', icon: BuildingIcon }, // Note: Using fallback icon if BuildingIcon missing
                { role: 'System Admin', use: 'Full oversight, provisioning', icon: ShieldCheckIcon } // Note: Using fallback icons
              ].map((r, i) => (
                <div key={i} className="p-8 rounded-3xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-center hover:border-primary/50 transition-colors group">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-400 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                    <r.icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-slate-900 dark:text-white mb-2">{r.role}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{r.use}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- FINAL CTA --- */}
        <section className="py-24 px-6">
           <div className="max-w-5xl mx-auto glass p-12 md:p-20 text-center relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
              
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-8 relative z-10 tracking-tight leading-tight">
                Ready to optimize your <br /> service experience?
              </h2>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                <Link to="/register" className="btn-primary py-4 px-12 rounded-2xl text-lg shadow-2xl shadow-primary/30">
                  Register Account
                </Link>
                <Link to="/login" className="text-sm font-black text-slate-600 dark:text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">
                  Experience Demo
                </Link>
              </div>
           </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-slate-200 dark:border-slate-800 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-primary/20 p-1.5 rounded-lg text-primary">
              <TruckIcon className="w-5 h-5" />
            </div>
            <span className="font-black text-slate-800 dark:text-white uppercase tracking-tighter">VSM</span>
          </div>
          <div className="flex gap-8 text-xs font-black text-slate-400 uppercase tracking-widest">
             <a href="#" className="hover:text-primary transition-colors">Documentation</a>
             <a href="#" className="hover:text-primary transition-colors">Privacy</a>
             <a href="#" className="hover:text-primary transition-colors">Status</a>
          </div>
          <p className="text-xs font-bold text-slate-400">© 2026 VSM Platform. Built for the future of service.</p>
        </div>
      </footer>
    </div>
  );
};

// Simple Fallback Icons for missing ones
const BuildingIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
  </svg>
);

const ShieldCheckIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

export default Home;
