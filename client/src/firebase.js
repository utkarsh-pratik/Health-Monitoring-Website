// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ,
  authDomain: "real-estate-5aa1e.firebaseapp.com",
  projectId: "real-estate-5aa1e",
  storageBucket: "real-estate-5aa1e.firebasestorage.app",
  messagingSenderId: "702425465009",
  appId: "1:702425465009:web:8255fbed8f2293be58e290",
  measurementId: "G-WBST2SKTSJ"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);