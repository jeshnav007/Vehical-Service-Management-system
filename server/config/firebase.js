import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';

dotenv.config();

let db = null;
let auth = null;
let isInitialized = false;

try {
  if (!getApps().length) {
    let credential = null;

    // Option 1: Full service account JSON provided via environment variable
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      try {
        const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY.trim();
        const jsonString = rawKey.startsWith('{')
          ? rawKey
          : Buffer.from(rawKey, 'base64').toString('utf8');
        const serviceAccount = JSON.parse(jsonString);
        credential = cert(serviceAccount);
      } catch (err) {
        console.error('⚠️ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', err.message);
      }
    }

    // Option 2: Individual environment variables
    if (!credential && process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
        credential = cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        });
      } catch (err) {
        console.error('⚠️ Failed to configure individual Firebase credentials:', err.message);
      }
    }

    // Option 3: Default application credentials or Project ID fallback
    if (!credential) {
      try {
        credential = applicationDefault();
      } catch (e) {
        // Fallback for startup before credentials entered
      }
    }

    const appOptions = {};
    if (credential) {
      appOptions.credential = credential;
    }
    if (process.env.FIREBASE_PROJECT_ID) {
      appOptions.projectId = process.env.FIREBASE_PROJECT_ID;
    }

    if (credential || process.env.FIREBASE_PROJECT_ID) {
      initializeApp(appOptions);
      isInitialized = true;
      console.log('🔥 Firebase Admin SDK initialized successfully.');
    } else {
      console.warn('⚠️ Firebase credentials not detected yet. Please set FIREBASE_SERVICE_ACCOUNT_KEY or FIREBASE_PROJECT_ID in server/.env or Render.');
      initializeApp({ projectId: 'vsm-placeholder' });
      isInitialized = true;
    }
  }

  db = getFirestore();
  auth = getAuth();
} catch (error) {
  console.error('⚠️ Firebase Admin initialization error:', error.message);
}

/**
 * Format Firestore document data to match the format expected by the frontend
 * Converts doc.id to _id and id, and converts Firestore Timestamps to ISO strings
 */
export const docWithId = (docSnapshot) => {
  if (!docSnapshot || !docSnapshot.exists) return null;
  const data = docSnapshot.data();

  const formatted = { ...data };
  for (const [key, value] of Object.entries(formatted)) {
    if (value && typeof value === 'object' && typeof value.toDate === 'function') {
      formatted[key] = value.toDate().toISOString();
    }
  }

  return {
    _id: docSnapshot.id,
    id: docSnapshot.id,
    ...formatted,
  };
};

/**
 * Format an array of Firestore query snapshots
 */
export const docsWithId = (querySnapshot) => {
  if (!querySnapshot || querySnapshot.empty) return [];
  return querySnapshot.docs.map(docWithId);
};

export { db, auth, isInitialized };
