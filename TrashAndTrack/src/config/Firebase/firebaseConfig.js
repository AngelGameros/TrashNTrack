// src/config/Firebase/firebaseConfig.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; // IMPORTANTE: Importa Firestore

// Tu configuración de Firebase específica, leyendo de variables de entorno.
// ASEGÚRATE de que estas variables están en tu archivo /.env en /TNT/TrashAndTrack/.env
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID
};

// Inicializar la aplicación Firebase
const app = initializeApp(firebaseConfig);

// Obtener la instancia de autenticación (Auth)
const authInstance = getAuth(app);

// Obtener la instancia de Firestore Database (db)
const db = getFirestore(app);

// Exportar los servicios de Firebase que vas a utilizar en tu aplicación
export { authInstance as auth, db }; // Exporta 'auth' Y 'db'