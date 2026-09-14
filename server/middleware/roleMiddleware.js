const admin = (req, res, next) => {
  const role = req.user?.role?.toLowerCase();
  if (role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

const serviceCenter = (req, res, next) => {
  const role = req.user?.role?.toLowerCase();
  if (role === 'servicecenter' || role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as service center' });
  }
};

const technician = (req, res, next) => {
  const role = req.user?.role?.toLowerCase();
  if (role === 'technician' || role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as technician' });
  }
};

export { admin, serviceCenter, technician };
