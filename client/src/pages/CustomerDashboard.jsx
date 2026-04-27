import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getMyVehicles } from '../redux/slices/vehicleSlice';
import { getMyAppointments, cancelAppointment } from '../redux/slices/appointmentSlice';
import { getMyInvoices } from '../redux/slices/invoiceSlice';
import { toast } from 'react-hot-toast';
import axiosInstance from '../services/axiosInstance';
import { SERVICES_URL, STATUS } from '../utils/constants';
import NotificationCard from '../components/NotificationCard';
import ServiceHistoryCard from '../components/ServiceHistoryCard';
import Card from '../components/common/Card';
import StatusBadge from '../components/common/StatusBadge';
import Loader from '../components/common/Loader';
import { TruckIcon, CalendarIcon, CreditCardIcon } from '../utils/Icons';

const STATUS_STEPS = [STATUS.PENDING, STATUS.APPROVED, STATUS.ASSIGNED, STATUS.IN_PROGRESS, STATUS.COMPLETED];

const CustomerDashboard = () => {
  const dispatch = useDispatch();
  
  const { vehicles, loading: vLoading, error: vError } = useSelector((state) => state.vehicles);
  const { appointments, loading: aLoading, error: aError } = useSelector((state) => state.appointments);
  const { invoices, loading: iLoading } = useSelector((state) => state.invoices);

  const [serviceHistory, setServiceHistory] = useState([]);
  const [shLoading, setShLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(getMyVehicles());
    dispatch(getMyAppointments());
    dispatch(getMyInvoices());
    
    const fetchHistory = async () => {
      try {
        const { data } = await axiosInstance.get(`${SERVICES_URL}/myservices`);
        setServiceHistory(data);
      } catch (err) {
        console.error(err);
      } finally {
        setShLoading(false);
      }
    };
    fetchHistory();
  }, [dispatch]);

  const handleCancelClick = (appointmentId) => {
    setCancellingId(appointmentId);
    setCancelReason('');
  };

  const submitCancellation = async () => {
    if (!cancellingId) return;
    
    setIsSubmitting(true);
    try {
      await dispatch(cancelAppointment({ id: cancellingId, cancellationReason: cancelReason })).unwrap();
      toast.success('Appointment cancelled successfully');
      setCancellingId(null);
    } catch (err) {
      toast.error(err || 'Failed to cancel appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
            Manage your vehicles and track your service status.
          </p>
        </div>
        <div className="flex gap-3">
           <Link to="/book-service" className="btn-primary flex items-center gap-2">
             <CalendarIcon className="w-5 h-5" /> Book Service
           </Link>
           <Link to="/add-vehicle" className="btn-accent flex items-center gap-2">
             <TruckIcon className="w-5 h-5" /> Add Vehicle
           </Link>
        </div>
      </header>
      
      <NotificationCard />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* My Garage */}
        <Card title="My Garage" subtitle="Quick view of your registered vehicles" className="h-full">
          {vLoading ? <Loader text="Retrieving vehicles..." /> : vError ? <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium">{vError}</div> : (
            <div className="space-y-3 mt-4">
              {vehicles.map(v => (
                <div key={v._id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all group">
                   <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm group-hover:bg-primary/5 transition-colors">
                     <TruckIcon className="w-6 h-6 text-primary" />
                   </div>
                   <div>
                     <h4 className="font-bold text-slate-800 dark:text-slate-200">{v.year} {v.make} {v.model}</h4>
                     <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{v.licensePlate}</p>
                   </div>
                </div>
              ))}
              {vehicles.length === 0 && <p className="text-sm text-slate-500 text-center py-6 italic">No vehicles registered yet.</p>}
            </div>
          )}
        </Card>
        
        {/* Appointments Status */}
        <Card title="Appointment Tracking" subtitle="Real-time progress overview" className="h-full">
          {aLoading ? <Loader text="Syncing appointments..." /> : aError ? <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium">{aError}</div> : (
            <div className="space-y-6 mt-4">
              {appointments.map(a => (
                <div key={a._id} className="p-5 bg-white dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors" />
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{a.serviceType}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
                        {new Date(a.date).toLocaleDateString()} at {a.time} • {a.vehicle?.make}
                      </p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  
                  {/* Cancel Button - Relocated to top-right corner */}
                  {(a.status === STATUS.PENDING || a.status === STATUS.APPROVED || a.status === STATUS.ASSIGNED) && (
                    <button 
                      onClick={() => handleCancelClick(a._id)}
                      className="absolute top-5 right-5 text-[10px] font-bold uppercase tracking-wider text-rose-500 hover:text-white hover:bg-rose-500 px-3 py-1.5 rounded-xl transition-all duration-300 border border-rose-200 dark:border-rose-900/50 hover:border-rose-500 shadow-sm"
                    >
                      Cancel
                    </button>
                  )}
                  
                  {/* Terminal State Reason Display */}
                  {(a.status === STATUS.CANCELLED || a.status === STATUS.REJECTED) && (
                    <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        {a.status === STATUS.CANCELLED ? 'Cancellation' : 'Rejection'} Note
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic">
                        "{a.cancellationReason || a.rejectionReason || 'No reason specified'}"
                      </p>
                    </div>
                  )}
                  
                  {/* Modern Timeline Tracker */}
                  <div className="relative pt-6 pb-2">
                    {a.status === STATUS.CANCELLED || a.status === STATUS.REJECTED ? (
                      <div className="h-[2px] w-full bg-slate-200 dark:bg-slate-700 relative flex items-center justify-center">
                        <div className="px-3 bg-white dark:bg-[#0f172a] text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em]">
                          Workflow Terminated
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="absolute top-[34px] left-0 right-1 height-[2px] bg-slate-200 dark:bg-slate-700 z-0"></div>
                        <div className="flex justify-between relative z-10">
                          {STATUS_STEPS.map((step, idx) => {
                            const currentStatusIdx = STATUS_STEPS.indexOf(a.status);
                            const isActive = currentStatusIdx >= idx;
                            const isCurrent = currentStatusIdx === idx;
                            
                            return (
                              <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                                <div className={`
                                    w-5 h-5 rounded-full border-4 flex items-center justify-center transition-all duration-500
                                    ${isActive ? 'bg-primary border-primary ring-4 ring-primary/20' : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-600'}
                                    ${isCurrent ? 'animate-pulse' : ''}
                                `}>
                                  {isActive && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                </div>
                                <span className={`text-[9px] font-extrabold uppercase tracking-tighter ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-600'}`}>
                                  {step?.split(' ')[0]}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {appointments.length === 0 && <p className="text-sm text-slate-500 text-center py-6 italic">No upcoming appointments.</p>}
            </div>
          )}
        </Card>

        {/* Full Service History */}
        <Card title="Diagnostics & History" subtitle="Full breakdown of past repairs" className="lg:col-span-2">
          {shLoading ? <Loader text="Compiling history..." /> : <ServiceHistoryCard records={serviceHistory} />}
        </Card>

        {/* Payment Center */}
        <Card title="Billing & Checkout" className="lg:col-span-2 bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-slate-600 dark:text-slate-300 font-medium max-w-md">
                Review detailed invoices, tax breakdowns, and settle outstanding balances via our secure native Payment Node.
              </p>
            </div>
            <Link to="/payments" className="btn-primary flex items-center gap-3 whitespace-nowrap shadow-xl shadow-primary/30 active:scale-95 group">
              <CreditCardIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
              Access Payment Hub
            </Link>
          </div>
        </Card>

      </div>

      {/* Cancellation Modal */}
      {cancellingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase tracking-widest rounded-md border border-rose-200 dark:border-rose-800">
                Warning
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Cancel Appointment?</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              Please let us know why you are cancelling this service request. This action cannot be undone once confirmed.
            </p>
            
            <textarea 
              className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm focus:ring-primary mb-6 h-32"
              placeholder="e.g. Plans changed, found another provider..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            
            <div className="flex gap-3">
              <button 
                onClick={() => setCancellingId(null)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Go Back
              </button>
              <button 
                onClick={submitCancellation}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/30 hover:bg-rose-600 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
