'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  if (getApps().length) {
    return getSdks(getApp());
  }

  // In environments like Vercel, automatic initialization will fail because
  // it's not a Firebase Hosting environment. We must rely on the explicit config.
  // We prioritize the explicit config if it exists and seems valid.
  if (firebaseConfig && firebaseConfig.projectId) {
    const firebaseApp = initializeApp(firebaseConfig);
    return getSdks(firebaseApp);
  }

  // Fallback for Firebase Hosting environments where config is injected automatically.
  try {
    const firebaseApp = initializeApp();
    return getSdks(firebaseApp);
  } catch (e) {
    console.error(
      'Firebase initialization failed. Please check your firebaseConfig object.',
      e
    );
    // If all attempts fail, we cannot proceed.
    // This will likely cause subsequent errors, which is expected
    // as Firebase is not configured.
    throw new Error('Could not initialize Firebase. Please check your configuration.');
  }
}


export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
