import dotenv from 'dotenv';
import { auth, db } from '../config/firebase.js';

dotenv.config();

const seedMechanic = async () => {
  const email = 'mechanic@vsm.com';
  const password = 'MechanicPassword123!';

  try {
    let uid;
    try {
      const user = await auth.getUserByEmail(email);
      uid = user.uid;
      console.log(`Firebase Auth account already exists for ${email}`);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        const user = await auth.createUser({
          email,
          password,
          displayName: 'Master Technician',
        });
        uid = user.uid;
        console.log(`Created Firebase Auth user: ${email}`);
      } else {
        throw err;
      }
    }

    await db.collection('users').doc(uid).set({
      name: 'Master Technician',
      email: email.toLowerCase(),
      phone: '555-555-5555',
      role: 'Technician',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    await db.collection('technicians').doc(uid).set({
      user: uid,
      employeeId: 'TECH-1001',
      specialization: ['Diagnostics', 'Engine Repair', 'Brakes'],
      availabilityStatus: 'Available',
      rating: 5,
      numReviews: 12,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    console.log(`✅ Technician Seeded: ${email}`);
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedMechanic();
