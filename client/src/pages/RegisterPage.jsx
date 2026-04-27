import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../redux/slices/authSlice';
import Loader from '../components/common/Loader';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
       navigate('/dashboard');
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    dispatch(register({ name, email, password, phone }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[480px] relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="glass p-10 border border-white/20 dark:border-slate-800 shadow-2xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-accent italic tracking-tighter mb-2">VSM</h1>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Join the Platform</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">Create your customer account today</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-sm font-bold animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <form onSubmit={submitHandler} className="space-y-5">
             <div className="form-group">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 mb-1.5 block">Full Name</label>
              <input
                type="text"
                required
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="form-group">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 mb-1.5 block">Email Address</label>
              <input
                type="email"
                required
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="form-group">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 mb-1.5 block">Phone</label>
                <input
                  type="text"
                  required
                  placeholder="+1 234..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-accent w-full py-4 text-lg shadow-xl shadow-accent/30 mt-4"
            >
              {loading ? <Loader className="h-5 w-5 border-white" /> : 'Create Secure Account'}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-slate-100 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Already have an account? {' '}
              <Link to="/login" className="text-accent hover:text-cyan-600 font-bold transition-colors">
                Log in here
              </Link>
            </p>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link to="/" className="text-sm text-slate-400 hover:text-accent transition-colors flex items-center justify-center gap-2">
                <span>←</span> Back to Landing Page
              </Link>
            </div>
          </div>
        </div>

         <p className="text-center mt-8 text-slate-400 dark:text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
          Secured by VSM Identity Node
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
