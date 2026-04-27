import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import TechnicianRoute from './components/TechnicianRoute';
import ServiceCenterRoute from './components/ServiceCenterRoute';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard';
import AddVehiclePage from './pages/AddVehiclePage';
import BookServicePage from './pages/BookServicePage';
import TechnicianDashboard from './pages/TechnicianDashboard';
import ServiceCenterDashboard from './pages/ServiceCenterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Payments from './pages/Payments';
import Profile from './pages/Profile';
import Home from './pages/Home';

const App = () => {
  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            borderRadius: '16px',
            background: '#0f172a',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)'
          },
        }}
      />
      <Routes>
        {/* Public Routes - No Layout */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Dashboard Routes - Wrapped in Layout */}
        <Route element={<Layout />}>
          {/* Customer / Default User */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<CustomerDashboard />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/add-vehicle" element={<AddVehiclePage />} />
            <Route path="/book-service" element={<BookServicePage />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Technician Operations */}
          <Route element={<TechnicianRoute />}>
            <Route path="/technician" element={<TechnicianDashboard />} />
          </Route>

          {/* Staff / Service Center */}
          <Route element={<ServiceCenterRoute />}>
            <Route path="/service-center" element={<ServiceCenterDashboard />} />
          </Route>

          {/* System Administrator */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
