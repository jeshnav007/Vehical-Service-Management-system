import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import axiosInstance from '../services/axiosInstance';
import { SERVICES_URL, STATUS } from '../utils/constants';
import { updateServiceRecordStatus } from '../redux/slices/serviceRecordSlice';
import Card from '../components/common/Card';
import StatusBadge from '../components/common/StatusBadge';
import Loader from '../components/common/Loader';
import { WrenchIcon, TruckIcon, HomeIcon } from '../utils/Icons';

const TechnicianDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Input states mapped by job ID
  const [laborHours, setLaborHours] = useState({});
  const [partName, setPartName] = useState({});
  const [partPrice, setPartPrice] = useState({});

  const dispatch = useDispatch();

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`${SERVICES_URL}/myjobs`);
      setJobs(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleUpdate = async (id, status) => {
    const payload = { status };
    
    if (status === STATUS.COMPLETED) {
      const lHours = parseFloat(laborHours[id]) || 0;
      const pName = partName[id] || '';
      const pPrice = parseFloat(partPrice[id]) || 0;

      if (!lHours) return toast.error('Labor hours are required to complete service!');

      payload.laborHours = lHours;
      if (pName && pPrice) {
        payload.partsUsed = [{ name: pName, quantity: 1, price: pPrice }];
      } else {
         payload.partsUsed = []; 
      }
    }

    try {
      await dispatch(updateServiceRecordStatus({ id, data: payload })).unwrap();
      
      setJobs(prev => prev.map(job => 
        job._id === id ? { ...job, status } : job
      ));
      
      if (status === STATUS.COMPLETED) {
        toast.success('Service marked as Completed!');
      } else if (status === STATUS.IN_PROGRESS) {
        toast.success('Repair job started');
      }
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Update failed');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Technician Workbench
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
          Internal repair logs and execution task queue.
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loading ? <div className="md:col-span-2"><Loader text="Syncing assigned tasks..." /></div> : error ? <div className="md:col-span-2 error">{error}</div> : (
          <>
            {jobs.map(job => (
              <Card key={job._id} className="relative overflow-hidden group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4 items-center">
                    <div className="bg-primary/10 p-3 rounded-2xl text-primary">
                      <WrenchIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{job.serviceType}</h3>
                      <p className="text-xs font-bold text-primary uppercase">ID: {job._id.slice(-6)}</p>
                    </div>
                  </div>
                  <StatusBadge status={job.status} />
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <TruckIcon className="w-5 h-5 text-slate-400" />
                    <span className="font-semibold text-slate-600 dark:text-slate-300">
                      {job.vehicle?.make} {job.vehicle?.model} ({job.vehicle?.licensePlate})
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 italic px-1">
                    "{job.description}"
                  </p>
                </div>

                {job.status === STATUS.IN_PROGRESS && (
                  <div className="mt-6 p-5 bg-primary/5 rounded-2xl border border-primary/20 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                       <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                       Execution Metrics
                    </h4>
                    
                    <div className="form-group mb-0">
                      <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Labor Hours (Required)</label>
                      <input 
                        type="number" 
                        min="0.5" step="0.5"
                        placeholder="e.g. 2.5" 
                        className="w-full text-sm"
                        onChange={(e) => setLaborHours({...laborHours, [job._id]: e.target.value})}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-group mb-0">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Part Name</label>
                        <input 
                          type="text" 
                          placeholder="Brake Pads" 
                          className="w-full text-sm"
                          onChange={(e) => setPartName({...partName, [job._id]: e.target.value})}
                        />
                      </div>
                      <div className="form-group mb-0">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Price ($)</label>
                        <input 
                          type="number" 
                          placeholder="45" 
                          className="w-full text-sm"
                          onChange={(e) => setPartPrice({...partPrice, [job._id]: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="mt-8 flex flex-col gap-2">
                  {job.status !== STATUS.COMPLETED && (
                    <button 
                      disabled={job.status === STATUS.IN_PROGRESS} 
                      onClick={() => handleUpdate(job._id, STATUS.IN_PROGRESS)}
                      className={`btn-primary w-full flex items-center justify-center gap-2 ${job.status === STATUS.IN_PROGRESS ? 'opacity-50 cursor-not-allowed bg-slate-400' : ''}`}
                    >
                      {job.status === STATUS.IN_PROGRESS ? 'Currently Repairing...' : 'Start Repair'}
                    </button>
                  )}
                  {job.status === STATUS.IN_PROGRESS && (
                    <button 
                      onClick={() => handleUpdate(job._id, STATUS.COMPLETED)}
                      className="btn-accent w-full flex items-center justify-center gap-2 py-3 shadow-accent/30"
                    >
                      Log Final Metrics & Complete
                    </button>
                  )}
                  {job.status === STATUS.COMPLETED && (
                    <div className="text-center py-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-800/50">
                       <span className="text-emerald-500 font-bold text-sm italic">Service Logic Finalized</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
            {jobs.length === 0 && <p className="md:col-span-2 text-center text-slate-500 italic py-12">No active repair assignments found.</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default TechnicianDashboard;
