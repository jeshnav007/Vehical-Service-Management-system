import dotenv from 'dotenv';
import { auth, db } from '../config/firebase.js';

dotenv.config();

const seedServiceCenter = async () => {
  const email = 'service@vsm.com';
  const password = 'ServicePassword123!';

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
          displayName: 'Master Service Center',
        });
        uid = user.uid;
        console.log(`Created Firebase Auth user: ${email}`);
      } else {
        throw err;
      }
    }

    await db.collection('users').doc(uid).set({
      name: 'Master Service Center',
      email: email.toLowerCase(),
      phone: '111-222-3333',
      role: 'ServiceCenter',
      isActive: true,
      address: 'Central VSM Workshop, Station 1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    console.log(`✅ ServiceCenter Profile configured: ${email}`);
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

seedServiceCenter();
