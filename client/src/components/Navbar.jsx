import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

const Navbar = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="navbar glass">
      <div className="nav-brand">VSM Platform</div>
      <div className="nav-links">
        {userInfo ? (
          <>
            <span className="user-badge">
              <strong>{userInfo.name}</strong> <em>({userInfo.role})</em>
            </span>
            {/* Primary Access Controls */}
            {(userInfo.role === 'Customer' || userInfo.role === 'Admin') && <Link className="nav-btn" to="/dashboard">Dashboard</Link>}
            {userInfo.role === 'Customer' && <Link className="nav-btn" style={{color:'#10b981'}} to="/payments">Payments</Link>}
            {(userInfo.role === 'Technician' || userInfo.role === 'Admin') && <Link className="nav-btn" to="/technician">Repairs View</Link>}
            {(userInfo.role === 'ServiceCenter' || userInfo.role === 'Admin') && <Link className="nav-btn" to="/service-center">Service Desk</Link>}
            {userInfo.role === 'Admin' && <Link className="nav-btn" to="/admin">Admin Hub</Link>}
            
            <Link className="nav-btn profile-link" to="/profile">
              <span className="profile-icon">👤</span> My Profile
            </Link>

            <button className="btn-logout" onClick={logoutHandler}>Logout</button>
          </>
        ) : (
          <>
            <Link className="nav-btn" to="/login">Login</Link>
            <Link className="nav-btn" to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
