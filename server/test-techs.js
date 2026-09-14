import { db, docsWithId } from './config/firebase.js';

async function test() {
  try {
    const snapshot = await db.collection('users').where('role', '==', 'Technician').get();
    const techs = docsWithId(snapshot);
    console.log("Technicians fetched:");
    console.log(JSON.stringify(techs, null, 2));
  } catch(e) {
    console.error(e);
  }
  process.exit(0);
}
test();
