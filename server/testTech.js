import { db } from './config/firebase.js';

async function run() {
  try {
    console.log("Testing query 1: with isActive != false");
    const snap1 = await db.collection('users')
      .where('role', '==', 'Technician')
      .where('isActive', '!=', false)
      .get();
    console.log(`Query 1 found: ${snap1.size}`);

    console.log("Testing query 2: without isActive");
    const snap2 = await db.collection('users')
      .where('role', '==', 'Technician')
      .get();
    console.log(`Query 2 found: ${snap2.size}`);

  } catch (err) {
    console.error("Error:", err.message);
  }
  process.exit(0);
}
run();
