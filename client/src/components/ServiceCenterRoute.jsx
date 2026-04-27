import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ServiceCenterRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  // Restrict access ONLY if role === "ServiceCenter" per system architecture
  return userInfo && userInfo.role === 'ServiceCenter' ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ServiceCenterRoute;
