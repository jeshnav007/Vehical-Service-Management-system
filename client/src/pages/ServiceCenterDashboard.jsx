import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAppointments, approveAppointment, rejectAppointment } from '../redux/slices/appointmentSlice';
import { toast } from 'react-hot-toast';
import { createServiceRecord } from '../redux/slices/serviceRecordSlice';
import { createInvoice, getInvoices } from '../redux/slices/invoiceSlice';
import axiosInstance from '../services/axiosInstance';
import { USERS_URL, SERVICES_URL, STATUS } from '../utils/constants';
import Card from '../components/common/Card';
import StatusBadge from '../components/common/StatusBadge';
import Loader from '../components/common/Loader';
import Table, { TableRow, TableCell } from '../components/common/Table';
import { CalendarIcon, WrenchIcon, CreditCardIcon } from '../utils/Icons';

const ServiceCenterDashboard = () => {
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechs, setSelectedTechs] = useState({});
  const [assigning, setAssigning] = useState(false);
  const [serviceRecords, setServiceRecords] = useState([]);
  
  // Invoice states
  const [generatingId, setGeneratingId] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const dispatch = useDispatch();
  const { appointments, loading: appsLoading, error: appsError } = useSelector((state) => state.appointments);
  const { invoices } = useSelector((state) => state.invoices);

  const fetchServiceRecords = async () => {
    try {
      const { data } = await axiosInstance.get(SERVICES_URL);
      setServiceRecords(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecords(false);
    }
  };

  useEffect(() => {
    dispatch(getAppointments());
    dispatch(getInvoices());
    fetchServiceRecords();

    const fetchTechnicians = async () => {
      try {
        const { data } = await axiosInstance.get(`${USERS_URL}/technicians`);
        setTechnicians(data);
      } catch (error) {
        console.error('Failed to fetch technicians:', error.response?.data || error.message);
      }
    };
    fetchTechnicians();
  }, [dispatch]);

  const handleSelectChange = (apptId, techId) => {
    setSelectedTechs(prev => ({ ...prev, [apptId]: techId }));
  };

  const handleApprove = async (id) => {
    try {
      await dispatch(approveAppointment(id)).unwrap();
      toast.success('Appointment Approved Successfully');
    } catch (err) {
      toast.error(`Approval sync failed: ${err}`);
    }
  };

  const handleReject = async () => {
    if (!rejectingId) return;
    setIsRejecting(true);
    try {
      await dispatch(rejectAppointment({ id: rejectingId, rejectionReason })).unwrap();
      toast.success('Appointment Rejected');
      setRejectingId(null);
      setRejectionReason('');
    } catch (err) {
      toast.error(`Rejection failed: ${err}`);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleAssign = async (appt) => {
    if (!selectedTechs[appt._id]) return toast.error('Please select a technician first!');

    setAssigning(true);
    try {
      await dispatch(createServiceRecord({
        vehicle: appt.vehicle?._id || appt.vehicle,
        appointment: appt._id,
        technician: selectedTechs[appt._id],
        serviceType: appt.serviceType,
        description: appt.notes || 'Routine check',
      })).unwrap();

      dispatch({
        type: 'appointments/manuallyUpdateAppointmentStatus',
        payload: { id: appt._id, status: STATUS.ASSIGNED }
      });
      fetchServiceRecords();
      toast.success('Technician Dispatched Successfully');
    } catch (err) {
      toast.error(`Assignment failed: ${err}`);
    } finally {
      setAssigning(false);
    }
  };

  const handleGenerateInvoice = async (recordId) => {
    setGeneratingId(recordId);
    try {
      const selectedRecord = serviceRecords.find(r => r._id === recordId);
      if (!selectedRecord || selectedRecord.status !== "Completed") {
        toast.error('Service must be Completed first.');
        return;
      }

      await dispatch(createInvoice({ serviceRecord: recordId })).unwrap();
      dispatch(getInvoices());
      fetchServiceRecords();
      toast.success('Invoice Generated Successfully!');
    } catch (err) {
      toast.error(`Invoice generation failed: ${err}`);
    } finally {
      setGeneratingId(null);
    }
  };

  const openInvoicePreview = (recordId) => {
    const inv = invoices.find(i => String(i.serviceRecord?._id || i.serviceRecord) === String(recordId));
    if (inv) {
      setViewingInvoice(inv);
    } else {
      toast.error('Invoice details not found in sync. Try refreshing.');
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Service Center Desk
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
          Manage system-wide appointments and technician dispatches.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8">

        {/* Appointments Queue Tracker */}
        <Card title="Master Appointment Queue" subtitle="Track and move incoming bookings through the pipeline" className="bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800">
          {appsLoading ? <Loader text="Loading queue..." /> : appsError ? <div className="error">{appsError}</div> : (
            <Table headers={['Customer', 'Vehicle', 'Date', 'Status', 'Actions']}>
              {appointments.map(a => (
                <TableRow key={a._id}>
                  <TableCell className="font-bold text-slate-700 dark:text-slate-200">{a.user?.name || 'Unknown'}</TableCell>
                  <TableCell>{a.vehicle?.make} {a.vehicle?.model}</TableCell>
                  <TableCell className="text-slate-500">{new Date(a.date).toLocaleDateString()}</TableCell>
                  <TableCell><StatusBadge status={a.status} /></TableCell>
                  <TableCell>
                    {a.status === STATUS.PENDING ? (
                      <div className="flex gap-2">
                        <button onClick={() => handleApprove(a._id)} className="btn-accent px-3 py-1.5 text-xs">
                          Approve
                        </button>
                        <button onClick={() => setRejectingId(a._id)} className="bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50 px-3 py-1.5 text-xs rounded-lg font-bold transition-colors">
                          Reject
                        </button>
                      </div>
                    ) : a.status === STATUS.APPROVED ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <select
                            onChange={(e) => handleSelectChange(a._id, e.target.value)}
                            value={selectedTechs[a._id] || ''}
                            className="text-xs bg-white dark:bg-slate-800 border-slate-200 py-1.5"
                          >
                            <option value="" disabled>Select Tech</option>
                            {technicians.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                          </select>
                          <button
                            onClick={() => handleAssign(a)}
                            disabled={assigning || technicians.length === 0}
                            className="btn-primary px-3 py-1.5 text-xs flex items-center gap-1"
                          >
                            Dispatch
                          </button>
                        </div>
                        <button 
                          onClick={() => setRejectingId(a._id)}
                          className="text-[10px] font-bold uppercase tracking-wider text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors text-left pl-1"
                        >
                          Cancel / Reject this booking
                        </button>
                      </div>
                    ) : a.status === STATUS.REJECTED ? (
                      <span className="text-rose-500 font-bold text-[10px] uppercase tracking-wider border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 px-2 py-1 rounded-md">
                        Rejected
                      </span>
                    ) : a.status === STATUS.CANCELLED ? (
                      <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded-md">
                        Cancelled
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-xs">Technician Assigned</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {appointments.length === 0 && (
                <TableRow><TableCell colSpan="5" className="text-center py-8 text-slate-400 italic">No appointments in queue.</TableCell></TableRow>
              )}
            </Table>
          )}
        </Card>

        {/* Global Progress + Invoice Generator */}
        <Card title="Live Repair Monitors" subtitle="Real-time oversight of technician performance and job completion" className="bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800">
          {loadingRecords ? <Loader text="Syncing records..." /> : (
            <Table headers={['Job Type', 'Mechanic', 'Vehicle', 'Status', 'Billing Output']}>
              {serviceRecords.map(r => (
                <TableRow key={r._id}>
                  <TableCell className="font-bold flex items-center gap-2">
                    <WrenchIcon className="w-4 h-4 text-primary" />
                    {r.serviceType}
                  </TableCell>
                  <TableCell>{r.technician?.name || 'Unknown'}</TableCell>
                  <TableCell className="font-mono text-xs">{r.vehicle?.licensePlate || 'N/A'}</TableCell>
                  <TableCell><StatusBadge status={r.status} /></TableCell>
                  <TableCell>
                    {r.status !== "Completed" ? (
                      <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-800 px-2.3 py-1 rounded-lg bg-slate-100/50 dark:bg-slate-900/30">
                         Production Pending
                      </span>
                    ) : (!r.invoiceGenerated && !invoices.some(inv => String(inv.serviceRecord?._id || inv.serviceRecord) === String(r._id))) ? (
                      <button
                        onClick={() => handleGenerateInvoice(r._id)}
                        disabled={generatingId === r._id}
                        className="btn-accent px-3 py-1.5 text-xs flex items-center gap-1 shadow-accent/20 disabled:opacity-50"
                      >
                        <CreditCardIcon className="w-4 h-4" /> 
                        {generatingId === r._id ? 'Generating...' : 'Generate Invoice'}
                      </button>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                           {/* Fallback check for isPaid for legacy records */}
                           {(() => {
                             const inv = invoices.find(i => String(i.serviceRecord?._id || i.serviceRecord) === String(r._id));
                             const isPaid = r.isPaid || (inv && inv.paymentStatus === 'Paid');
                             return (
                               <>
                                 <span className={`w-2 h-2 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                 <span className={`text-[10px] font-black uppercase tracking-tight ${isPaid ? 'text-emerald-500' : 'text-amber-500'}`}>
                                    {isPaid ? 'Settled & Paid' : 'Invoice Dispatched'}
                                 </span>
                               </>
                             );
                           })()}
                        </div>
                        <button 
                          onClick={() => openInvoicePreview(r._id)}
                          className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 group w-max"
                        >
                          View Billing Details
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 group-hover:translate-x-0.5 transition-transform">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {serviceRecords.length === 0 && (
                <TableRow><TableCell colSpan="5" className="text-center py-8 text-slate-400 italic">No active repairs.</TableCell></TableRow>
              )}
            </Table>
          )}
        </Card>

      </div>

      {/* Rejection Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase tracking-widest rounded-md border border-rose-200 dark:border-rose-800">
                Warning
              </span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Reject Appointment</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
              Please provide a reason for rejecting this service request. This action is terminal and will notify the customer immediately.
            </p>

            <textarea
              className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm focus:ring-primary mb-6 h-32"
              placeholder="e.g. Schedule full, part unavailable, service not offered..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />

            <div className="flex gap-3">
              <button
                onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isRejecting}
                className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/30 hover:bg-rose-600 active:scale-95 transition-all disabled:opacity-50"
              >
                {isRejecting ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Preview Modal */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl border border-white/10 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-accent" />
            
            <button 
              onClick={() => setViewingInvoice(null)}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-2 block">Official Billing Statement</span>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white">Invoice #{viewingInvoice._id.toString().substring(0, 8).toUpperCase()}</h2>
              </div>
              <div className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider border ${
                viewingInvoice.paymentStatus === 'Paid' 
                ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                : 'bg-amber-100 text-amber-700 border-amber-200'
              }`}>
                {viewingInvoice.paymentStatus}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-10 pb-8 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Customer Details</h4>
                <p className="font-bold text-slate-800 dark:text-slate-200">{viewingInvoice.user?.name || 'Authorized Client'}</p>
                <p className="text-sm text-slate-500">{viewingInvoice.vehicle?.make} {viewingInvoice.vehicle?.model} ({viewingInvoice.vehicle?.licensePlate || 'N/A'})</p>
              </div>
              <div className="text-right">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Issue Date</h4>
                <p className="font-bold text-slate-800 dark:text-slate-200">{new Date(viewingInvoice.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-4 mb-10">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-500">Service Subtotal</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">${viewingInvoice.amount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="text-slate-500">Tax & Surcharges (10%)</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">${viewingInvoice.tax?.toFixed(2)}</span>
              </div>
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-4" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Total Amount Due</span>
                <span className="text-3xl font-black text-primary">${viewingInvoice.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => window.print()}
                className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black rounded-2xl hover:bg-slate-200 transition-all text-sm uppercase tracking-widest"
              >
                Download PDF
              </button>
              <button
                onClick={() => setViewingInvoice(null)}
                className="flex-1 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/40 active:scale-[0.98] transition-all text-sm uppercase tracking-widest"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCenterDashboard;
