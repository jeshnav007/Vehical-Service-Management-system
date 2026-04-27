import { useEffect, useState } from 'react';
import axiosInstance from '../services/axiosInstance';
import { USERS_URL, SERVICES_URL } from '../utils/constants';
import NotificationCard from '../components/NotificationCard';
import Card from '../components/common/Card';
import Table, { TableRow, TableCell } from '../components/common/Table';
import Loader from '../components/common/Loader';
import { UsersIcon, TruckIcon, CalendarIcon, WrenchIcon, CreditCardIcon } from '../utils/Icons';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [serviceRecords, setServiceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewInactive, setViewInactive] = useState(false);

  // Mechanic Form States
  const [techName, setTechName] = useState('');
  const [techEmail, setTechEmail] = useState('');
  const [techPass, setTechPass] = useState('');
  const [techPhone, setTechPhone] = useState('');
  const [creating, setCreating] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVehicles: 0,
    totalAppointments: 0,
    completedServices: 0,
    pendingServices: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uRes, sRes, statsRes] = await Promise.all([
        axiosInstance.get(`${USERS_URL}?isActive=${viewInactive ? 'false' : 'true'}`).catch(() => ({ data: [] })),
        axiosInstance.get(SERVICES_URL).catch(() => ({ data: [] })),
        axiosInstance.get('/api/admin/stats').catch(() => ({ data: {} }))
      ]);
      setUsers(uRes.data);
      setServiceRecords(sRes.data);
      if (statsRes.data.totalUsers !== undefined) setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [viewInactive]);

  const handleDeleteUser = async (id) => {
    toast((t) => (
      <div className="flex flex-col gap-4">
        <p className="text-sm font-bold text-slate-800 dark:text-white">
          Do you want to deactivate this user? 
          <span className="block text-[10px] text-slate-400 mt-1 uppercase">They will lose system access immediately.</span>
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axiosInstance.delete(`${USERS_URL}/${id}`);
                fetchData();
                toast.success('User permanently removed from registry');
              } catch (error) {
                toast.error(`Deletion Failed: ${error.response?.data?.message || error.message}`);
              }
            }}
            className="px-3 py-1.5 text-xs font-bold bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20"
          >
            Confirm Deactivation
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
      style: { minWidth: '350px' }
    });
  };

  const handleRestoreUser = async (id) => {
    try {
      await axiosInstance.put(`/api/admin/users/${id}/restore`);
      toast.success('User account has been reactivated');
      fetchData();
    } catch (error) {
       toast.error(`Restoration Failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleFullDeleteUser = async (id) => {
    toast((t) => (
      <div className="flex flex-col gap-4">
        <p className="text-sm font-bold text-rose-600">
          ⚠️ PERMANENT CASCADE DELETE
          <span className="block text-[10px] text-slate-500 mt-1">
            This will wipe ALL vehicles, invoices, and service history. This is IRREVERSIBLE.
          </span>
        </p>
        <div className="flex gap-2 justify-end">
          <button onClick={() => toast.dismiss(t.id)} className="text-xs font-bold text-slate-400">Cancel</button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axiosInstance.delete(`/api/admin/users/${id}/full-delete`);
                fetchData();
                toast.success('System Registry Purged: User and all data removed');
              } catch (error) {
                toast.error(`Purge Failed: ${error.response?.data?.message || error.message}`);
              }
            }}
            className="px-3 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-lg"
          >
            PURGE EVERYTHING
          </button>
        </div>
      </div>
    ), { duration: 8000, style: { border: '1px solid #fda4af' } });
  };

  const handleCreateTech = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await axiosInstance.post(`${USERS_URL}/create-technician`, {
        name: techName,
        email: techEmail,
        password: techPass,
        phone: techPhone
      });
      setTechName(''); setTechEmail(''); setTechPass(''); setTechPhone('');
      fetchData();
      toast.success('Technician Provisioned Successfully');
    } catch (error) {
      toast.error(`Provisioning Failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          System Admin Panel
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
          High-level oversight and manual resource provisioning.
        </p>
      </header>

      <NotificationCard />
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: UsersIcon, color: 'text-primary' },
          { label: 'Vehicles', value: stats.totalVehicles, icon: TruckIcon, color: 'text-accent' },
          { label: 'Appointments', value: stats.totalAppointments, icon: CalendarIcon, color: 'text-amber-500' },
          { label: 'Completed', value: stats.completedServices, icon: WrenchIcon, color: 'text-emerald-500' },
          { label: 'Pending', value: stats.pendingServices, icon: WrenchIcon, color: 'text-rose-500' },
        ].map((item, i) => (
          <div key={i} className="glass p-5 flex flex-col items-center justify-center text-center group hover:scale-105 transition-transform duration-300">
            <div className={`p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 mb-2 ${item.color}`}>
              <item.icon className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">{item.value}</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* User Registry */}
        <Card 
          title={viewInactive ? "Deactivated User Archive" : "Global User Registry"} 
          className="lg:col-span-2 overflow-hidden" 
          noPadding
          extra={
            <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button 
                onClick={() => setViewInactive(false)}
                className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${!viewInactive ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-slate-400'}`}
              >
                Active
              </button>
              <button 
                onClick={() => setViewInactive(true)}
                className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${viewInactive ? 'bg-white dark:bg-slate-700 shadow-sm text-rose-500' : 'text-slate-400'}`}
              >
                Inactive
              </button>
            </div>
          }
        >
          {loading ? <Loader text="Fetching users..." /> : (
            <Table headers={['Name', 'Role', 'Email', 'Actions']}>
              {users.map(u => (
                <TableRow key={u._id}>
                  <TableCell className="font-bold">{u.name}</TableCell>
                  <TableCell>
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                      u.role === 'Admin' ? 'bg-rose-100 text-rose-600' : 
                      u.role === 'Technician' ? 'bg-emerald-100 text-emerald-600' : 
                      'bg-primary/10 text-primary'
                    }`}>
                      {u.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-500 truncate max-w-[150px]">{u.email}</TableCell>
                  <TableCell>
                    {viewInactive ? (
                      <div className="flex gap-4">
                        <button 
                          onClick={() => handleRestoreUser(u._id)} 
                          className="text-emerald-500 hover:text-emerald-700 font-bold text-xs"
                        >
                          Restore
                        </button>
                        <button 
                          onClick={() => handleFullDeleteUser(u._id)} 
                          className="text-rose-500 hover:text-rose-700 font-bold text-xs"
                        >
                          Purge
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleDeleteUser(u._id)} 
                        disabled={u.role === 'Admin' || u.role === 'ServiceCenter'}
                        className="text-amber-500 hover:text-amber-700 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs"
                      >
                        Deactivate
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          )}
        </Card>

        {/* Technician Spawner */}
        <Card title="Provision Technician" subtitle="Register a new authorized mechanic">
          <form onSubmit={handleCreateTech} className="space-y-4">
            <div className="form-group">
              <input type="text" required placeholder="Full Name" value={techName} onChange={e=>setTechName(e.target.value)} className="w-full" />
            </div>
            <div className="form-group">
              <input type="email" required placeholder="Email Address" value={techEmail} onChange={e=>setTechEmail(e.target.value)} className="w-full" />
            </div>
            <div className="form-group">
              <input type="password" required placeholder="Secure Password" value={techPass} onChange={e=>setTechPass(e.target.value)} className="w-full" />
            </div>
            <div className="form-group">
              <input type="text" required placeholder="Phone Number" value={techPhone} onChange={e=>setTechPhone(e.target.value)} className="w-full" />
            </div>
            <button type="submit" disabled={creating} className="btn-primary w-full shadow-primary/20">
              {creating ? 'Processing...' : 'Provision Mechanic'}
            </button>
          </form>
        </Card>

        {/* Global Records Master View */}
        <Card title="Aggregated System Service Records" className="lg:col-span-3 overflow-hidden" noPadding>
          {loading ? <Loader text="Extracting records..." /> : (
            <Table headers={['Record ID', 'Service Type', 'Plate', 'Technician', 'Status']}>
              {serviceRecords.map((r, i) => (
                <TableRow key={r._id} className={i % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-800/20' : ''}>
                  <TableCell className="font-mono text-[10px] text-slate-400">#{r._id.slice(-8).toUpperCase()}</TableCell>
                  <TableCell className="font-bold">{r.serviceType}</TableCell>
                  <TableCell>{r.vehicle?.licensePlate || 'N/A'}</TableCell>
                  <TableCell className="text-slate-500 font-medium">{r.technician?.name || 'Unassigned'}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-bold ${r.status === 'Completed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {r.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {serviceRecords.length === 0 && (
                <TableRow><TableCell colSpan="5" className="text-center py-12 text-slate-400 italic font-medium">No records found in the active timeline.</TableCell></TableRow>
              )}
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
