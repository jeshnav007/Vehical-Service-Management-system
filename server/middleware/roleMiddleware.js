const admin = (req, res, next) => {
  if (req.user && req.user.role === 'Admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

const serviceCenter = (req, res, next) => {
  if (req.user && (req.user.role === 'ServiceCenter' || req.user.role === 'Admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as service center' });
  }
};

const technician = (req, res, next) => {
  if (req.user && req.user.role === 'Technician') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as technician' });
  }
};

export { admin, serviceCenter, technician };
