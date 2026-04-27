import { useEffect, useState } from 'react';
import axiosInstance from '../services/axiosInstance';
import { NOTIFICATIONS_URL } from '../utils/constants';
import Card from './common/Card';
import Loader from './common/Loader';
import toast from 'react-hot-toast';

const NotificationCard = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUnread = async () => {
    try {
      const { data } = await axiosInstance.get(NOTIFICATIONS_URL);
      setNotifications(data.filter(n => !n.isRead));
    } catch (err) {
      toast.error('Failed to sync system alerts');
      console.error('Failed fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnread();
  }, []);

  const markRead = async (id) => {
    try {
      await axiosInstance.put(`${NOTIFICATIONS_URL}/${id}/read`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Alert dismissed');
    } catch (err) {
      toast.error('Failed to update alert status');
    }
  };

  if (loading) return <Loader text="Checking alerts..." />;
  if (!notifications.length) return null;

  return (
    <Card 
      title="Active System Alerts" 
      subtitle="Important notifications regarding your service workflow."
      className="border-primary/20 bg-primary/5 mb-8"
    >
      <div className="space-y-3">
        {notifications.map(n => (
          <div 
            key={n._id} 
            className="flex items-center justify-between p-4 bg-white/40 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 rounded-xl transition-all hover:bg-white/60 dark:hover:bg-slate-800/60"
          >
            <div className="flex gap-4 items-center">
              <div className={`p-2 rounded-lg ${n.type === 'Alert' ? 'bg-rose-100 text-rose-500' : 'bg-primary/10 text-primary'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                </svg>
              </div>
              <div>
                <h4 className={`text-sm font-bold ${n.type === 'Alert' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                  {n.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                  {new Date(n.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button 
              onClick={() => markRead(n._id)}
              className="text-xs font-bold text-primary hover:text-indigo-700 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default NotificationCard;
