import asyncHandler from 'express-async-handler';
import { auth, db, docWithId } from '../config/firebase.js';
import { admin, serviceCenter, technician } from './roleMiddleware.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
      }

      // Verify the Firebase ID Token using Firebase Admin SDK
      let decoded;
      try {
        decoded = await auth.verifyIdToken(token);
      } catch (authErr) {
        console.error('Firebase Token Verification Failed:', authErr.message);
        return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
      }

      const uid = decoded.uid;

      // Fetch user profile from Cloud Firestore
      const userRef = db.collection('users').doc(uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        // Automatically create Firestore profile for newly registered Firebase Auth user
        const newProfile = {
          name: decoded.name || (decoded.email ? decoded.email.split('@')[0] : 'VSM User'),
          email: decoded.email || '',
          role: 'Customer',
          phone: '',
          address: '',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await userRef.set(newProfile);
        req.user = { _id: uid, id: uid, uid, ...newProfile };
        return next();
      }

      const userData = userDoc.data();

      // Check for deactivated user status (Soft Delete)
      if (userData.isActive === false) {
        return res.status(401).json({ message: 'Account has been deactivated. Please contact support.' });
      }

      // Attach user to request object (ensuring _id matches doc.id for 100% frontend compatibility)
      req.user = {
        _id: uid,
        id: uid,
        uid: uid,
        ...userData,
      };

      return next();
    } catch (error) {
      console.error('Auth Middleware Exception:', error);
      return res.status(401).json({ message: 'Not authorized, authentication failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
});

export { protect, admin, serviceCenter, technician };
