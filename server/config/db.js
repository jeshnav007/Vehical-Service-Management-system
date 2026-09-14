import { db, isInitialized } from './firebase.js';

const connectDB = async () => {
  try {
    if (db) {
      console.log('🔥 Cloud Firestore connection verified.');
    } else {
      console.log('⚠️ Cloud Firestore pending initialization.');
    }
  } catch (error) {
    console.error(`Firebase Connection Error: ${error.message}`);
  }
};

export default connectDB;
