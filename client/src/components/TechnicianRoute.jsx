import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const TechnicianRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo && userInfo.token && userInfo.role === 'Technician' ? <Outlet /> : <Navigate to="/login" replace />;
};

export default TechnicianRoute;
