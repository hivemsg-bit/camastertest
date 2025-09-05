import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let initialized = false;

export function getFirebaseAdmin() {
  if (!initialized) {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

    if (!serviceAccountJson || !storageBucket) {
      // eslint-disable-next-line no-console
      console.warn('Firebase not fully configured. Set FIREBASE_SERVICE_ACCOUNT_JSON and FIREBASE_STORAGE_BUCKET');
    }

    const credential = serviceAccountJson
      ? admin.credential.cert(JSON.parse(serviceAccountJson))
      : admin.credential.applicationDefault();

    admin.initializeApp({
      credential,
      storageBucket,
    });
    initialized = true;
  }
  return admin;
}

export function getStorageBucket() {
  return getFirebaseAdmin().storage().bucket();
}

