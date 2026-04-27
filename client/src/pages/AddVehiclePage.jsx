import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addVehicle } from '../redux/slices/vehicleSlice';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';
import { TruckIcon, ChevronLeftIcon } from '../utils/Icons';
import toast from 'react-hot-toast';

const AddVehiclePage = () => {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error } = useSelector((state) => state.vehicles);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await dispatch(addVehicle({ make, model, year, licensePlate })).unwrap();
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to add vehicle:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <Link 
        to="/dashboard" 
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors mb-2"
      >
        <ChevronLeftIcon className="w-4 h-4" /> Back to Dashboard
      </Link>

      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Register Vehicle
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
          Add a new vehicle to your digital garage to enable service booking.
        </p>
      </header>

      <Card>
        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-sm font-bold animate-in slide-in-from-top-2">
            {error}
          </div>
        )}

        <form onSubmit={submitHandler} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group mb-0">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 mb-1.5 block">Make</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Toyota"
                value={make} 
                onChange={(e) => setMake(e.target.value)} 
                className="w-full"
              />
            </div>
            <div className="form-group mb-0">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 mb-1.5 block">Model</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Camry"
                value={model} 
                onChange={(e) => setModel(e.target.value)} 
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group mb-0">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 mb-1.5 block">Year</label>
              <input 
                type="number" 
                required 
                placeholder="2023"
                value={year} 
                onChange={(e) => setYear(e.target.value)} 
                className="w-full"
              />
            </div>
            <div className="form-group mb-0">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 mb-1.5 block">License Plate</label>
              <input 
                type="text" 
                required 
                placeholder="VSM-1234"
                value={licensePlate} 
                onChange={(e) => setLicensePlate(e.target.value)} 
                className="w-full"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn-primary w-full py-4 text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-3 mt-4"
          >
            {loading ? <Loader className="h-5 w-5 border-white" /> : (
              <>
                <TruckIcon className="w-6 h-6" />
                Add Vehicle to Garage
              </>
            )}
          </button>
        </form>
      </Card>

      <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl">
         <div className="flex gap-4">
           <div className="p-2 bg-primary/10 rounded-lg text-primary h-fit">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
               <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 11.518 1.173L12 11.25zM12 9a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a6.75 6.75 0 100-13.5 6.75 6.75 0 000 13.5z" />
             </svg>
           </div>
           <div>
             <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Why register your vehicle?</h4>
             <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
               Registration allows our technicians to access manufacturer-specific service intervals and maintain a digital log of all repairs, enhancing your vehicle's resale value and safety.
             </p>
           </div>
         </div>
      </div>
    </div>
  );
};

export default AddVehiclePage;
