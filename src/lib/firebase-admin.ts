import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getDatabase, type Database } from "firebase-admin/database";

/**
 * Firebase Admin SDK — dipakai untuk sinkronisasi data ke Realtime Database.
 * Jika kredensial belum diisi di .env, semua fungsi sinkronisasi tidak aktif
 * dan aplikasi tetap berjalan normal (mode lokal saja).
 */

export function firebaseConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_DATABASE_URL &&
      process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
  );
}

export function getAdminDb(): Database | null {
  if (!firebaseConfigured()) return null;
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });
  }
  return getDatabase();
}
