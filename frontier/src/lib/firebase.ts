import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyCBKiUEqsyaXAGa6jjyZrlXiNw1a7JziYU',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'meridian-proj.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'meridian-proj',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'meridian-proj.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '68101417236',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:68101417236:web:0c3605e83484321df6ba01',
};

export const firebaseApp = initializeApp(firebaseConfig);
