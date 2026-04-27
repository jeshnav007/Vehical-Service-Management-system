import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../redux/slices/authSlice';
import Loader from '../components/common/Loader';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      if (userInfo.role === 'Admin') navigate('/admin');
      else if (userInfo.role === 'ServiceCenter') navigate('/service-center');
      else if (userInfo.role === 'Technician') navigate('/technician');
      else navigate('/dashboard');
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[440px] relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="glass p-10 border border-white/20 dark:border-slate-800 shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-primary italic tracking-tighter mb-2">VSM</h1>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Welcome Back</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Enter credentials to access your portal</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-sm font-bold animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form onSubmit={submitHandler} className="space-y-6">
            <div className="form-group">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 mb-1.5 block">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="form-group">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 mb-1.5 block">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 text-lg shadow-xl shadow-primary/30"
            >
              {loading ? <Loader className="h-5 w-5 border-white" /> : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Don't have an account? {' '}
              <Link to="/register" className="text-primary hover:text-indigo-700 font-bold transition-colors">
                Register here
              </Link>
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link to="/" className="text-sm text-slate-400 hover:text-primary transition-colors flex items-center justify-center gap-2">
                <span>←</span> Back to Landing Page
              </Link>
            </div>
          </div>
        </div>

        {/* Branding Footer */}
        <p className="text-center mt-8 text-slate-400 dark:text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
          Vehicle Service Management Platform v1.0
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
