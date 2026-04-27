import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createAppointment } from '../redux/slices/appointmentSlice';
import { getMyVehicles } from '../redux/slices/vehicleSlice';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import { CalendarIcon, ChevronLeftIcon } from '../utils/Icons';
import toast from 'react-hot-toast';

const BookServicePage = () => {
  const [vehicle, setVehicle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [serviceType, setServiceType] = useState('Maintenance');
  const [notes, setNotes] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { vehicles } = useSelector((state) => state.vehicles);
  const { loading, error } = useSelector((state) => state.appointments);

  useEffect(() => {
    dispatch(getMyVehicles());
  }, [dispatch]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createAppointment({ vehicle, date, time, serviceType, notes })).unwrap();
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to book appointment:', err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <Link 
        to="/dashboard" 
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors mb-2"
      >
        <ChevronLeftIcon className="w-4 h-4" /> Back to Dashboard
      </Link>

      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Book Service
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
          Schedule a maintenance or repair slot with our expert technician team.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            {error && (
              <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-sm font-bold animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <form onSubmit={submitHandler} className="space-y-6">
              <div className="form-group">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 mb-1.5 block">Select Vehicle</label>
                <select 
                  required 
                  value={vehicle} 
                  onChange={(e) => setVehicle(e.target.value)}
                  className="w-full"
                >
                  <option value="" disabled>-- Choose Vehicle from Garage --</option>
                  {vehicles.map(v => (
                    <option key={v._id} value={v._id}>
                      {v.year} {v.make} {v.model} ({v.licensePlate})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group mb-0">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 mb-1.5 block">Appointment Date</label>
                  <input 
                    type="date" 
                    required 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    className="w-full"
                  />
                </div>
                
                <div className="form-group mb-0">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 mb-1.5 block">Preferred Time</label>
                  <input 
                    type="time" 
                    required 
                    value={time} 
                    onChange={(e) => setTime(e.target.value)} 
                    className="w-full"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 mb-1.5 block">Service Type</label>
                <select 
                  required 
                  value={serviceType} 
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full"
                >
                  <option value="Maintenance">Routine Maintenance</option>
                  <option value="Diagnostic">Diagnostic Check</option>
                  <option value="Repair">Specific Repair</option>
                </select>
              </div>

              <div className="form-group">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 mb-1.5 block">Notes (Optional)</label>
                <textarea 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  placeholder="Tell us more about the issues or specific requirements..."
                  className="w-full min-h-[100px]"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loading || !vehicle} 
                className="btn-primary w-full py-4 text-lg shadow-xl shadow-primary/30 flex items-center justify-center gap-3"
              >
                {loading ? <Loader className="h-5 w-5 border-white" /> : (
                  <>
                    <CalendarIcon className="w-5 h-5 font-bold" />
                    Request Appointment Slot
                  </>
                )}
              </button>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              Service Guarantee
            </h4>
            <ul className="space-y-4 text-xs font-medium text-slate-500 dark:text-slate-400">
              <li className="flex gap-3">
                <span className="text-emerald-500 font-bold">✓</span>
                All repairs include a 12-month parts and labor warranty.
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-500 font-bold">✓</span>
                Genuine OEM parts used for all diagnostic and repair tasks.
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-500 font-bold">✓</span>
                Free multi-point safety inspection included with every booking.
              </li>
            </ul>
          </div>

          <div className="p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50 rounded-2xl">
            <h4 className="font-bold text-amber-700 dark:text-amber-400 text-sm mb-2">Notice</h4>
            <p className="text-xs text-amber-600/80 dark:text-amber-500/80 leading-relaxed">
              Same-day appointments are subject to technician availability. Please book at least 24 hours in advance for routine maintenance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookServicePage;
