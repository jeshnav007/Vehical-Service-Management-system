import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = () => {
  const { userInfo } = useSelector((state) => state.auth);
  return userInfo && userInfo.token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
