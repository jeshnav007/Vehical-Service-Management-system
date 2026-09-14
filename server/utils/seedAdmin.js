import dotenv from 'dotenv';
import { auth, db } from '../config/firebase.js';

dotenv.config();

const seedAdmin = async () => {
  const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@vsm.com';
  const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'AdminPassword123!';

  console.log('--- Seeding System Administrator ---');
  console.log(`Target Email: ${adminEmail}`);

  try {
    let uid;

    // 1. Check or create in Firebase Auth
    try {
      const existingUser = await auth.getUserByEmail(adminEmail);
      uid = existingUser.uid;
      console.log(`Firebase Auth account exists for ${adminEmail} (UID: ${uid})`);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        const newUser = await auth.createUser({
          email: adminEmail,
          password: adminPassword,
          displayName: 'System Admin',
        });
        uid = newUser.uid;
        console.log(`Created new Firebase Auth user for ${adminEmail} (UID: ${uid})`);
      } else {
        throw err;
      }
    }

    // 2. Set Admin role in Cloud Firestore
    const userRef = db.collection('users').doc(uid);
    await userRef.set(
      {
        name: 'System Admin',
        email: adminEmail.toLowerCase(),
        role: 'Admin',
        phone: '0000000000',
        address: 'VSM Headquarters',
        isActive: true,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      { merge: true }
    );

    console.log(`✅ System Administrator role assigned in Cloud Firestore.`);
    console.log(`Credentials: ${adminEmail} / ${adminPassword}`);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Admin Seeding Failed: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
