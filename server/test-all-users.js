import { db } from './config/firebase.js';

async function test() {
  try {
    const snap = await db.collection('users').get();
    const users = [];
    snap.forEach(doc => users.push({id: doc.id, ...doc.data()}));
    console.log(JSON.stringify(users, null, 2));
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
test();
