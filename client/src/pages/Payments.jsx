import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMyInvoices, payInvoice } from '../redux/slices/invoiceSlice';
import Card from '../components/common/Card';
import Table, { TableRow, TableCell } from '../components/common/Table';
import Loader from '../components/common/Loader';
import StatusBadge from '../components/common/StatusBadge';
import { CreditCardIcon } from '../utils/Icons';
import toast from 'react-hot-toast';

const Payments = () => {
  const dispatch = useDispatch();
  const { invoices, loading, error } = useSelector((state) => state.invoices);

  useEffect(() => {
    dispatch(getMyInvoices());
  }, [dispatch]);

  const handlePayment = async (id) => {
    try {
      await dispatch(payInvoice(id)).unwrap();
      toast.success('Secure Payment Sequence Approved locally!');
    } catch (err) {
      alert(`Payment Gateway Failed: ${err}`);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight text-center sm:text-left">
          Payment Hub
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1 text-center sm:text-left">
          Manage your service invoices and secure transaction history.
        </p>
      </header>

      <Card title="Invoice Management" subtitle="Settled and outstanding balances across your fleet">
        {loading ? <Loader text="Querying payment gateway..." /> : error ? <div className="error">{error}</div> : (
          <Table headers={['Invoice ID', 'Vehicle', 'Amount Due', 'Status', 'Action']}>
            {invoices.map(inv => (
              <TableRow key={inv._id}>
                <TableCell className="font-mono text-xs text-slate-400">#{inv._id.toString().substring(0, 8).toUpperCase()}</TableCell>
                <TableCell className="font-bold">{inv.vehicle?.make || 'Vehicle Data'}</TableCell>
                <TableCell className="text-lg font-black text-slate-800 dark:text-slate-100">${inv.totalAmount?.toFixed(2)}</TableCell>
                <TableCell>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                    inv.paymentStatus === 'Paid' 
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' 
                    : 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400'
                  }`}>
                    {inv.paymentStatus}
                  </span>
                </TableCell>
                <TableCell>
                  {inv.paymentStatus === 'Pending' ? (
                    <button 
                      onClick={() => handlePayment(inv._id)}
                      className="btn-primary flex items-center gap-2 px-4 py-2 text-sm shadow-primary/20"
                    >
                      <CreditCardIcon className="w-4 h-4" /> Pay Now
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-500 font-bold text-xs uppercase tracking-tight">
                       <span className="p-1 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                         </svg>
                       </span>
                       Settled {new Date(inv.paymentDate).toLocaleDateString()}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {invoices.length === 0 && (
              <TableRow>
                <TableCell colSpan="5" className="text-center py-12 text-slate-400 italic">No invoices found for your account.</TableCell>
              </TableRow>
            )}
          </Table>
        )}
      </Card>
      
      {/* Informational Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Secure Transactions', desc: 'All payments are encrypted using bank-grade AES-256 protocols.' },
          { title: 'Instant Confirmation', desc: 'Receive your digital receipt and service release immediately after checkout.' },
          { title: 'Tax Compliant', desc: 'Invoices include full tax breakdowns for business compliance.' }
        ].map((item, i) => (
          <div key={i} className="p-6 bg-white/40 dark:bg-white/5 border border-slate-100 dark:border-slate-800 rounded-2xl">
             <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">{item.title}</h4>
             <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Payments;
