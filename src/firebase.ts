// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAT9PESfuMNACLx9J-9voPORb_7HHFRS84",
  authDomain: "idverifybhucl.firebaseapp.com",
  projectId: "idverifybhucl",
  storageBucket: "idverifybhucl.firebasestorage.app",
  messagingSenderId: "36539597641",
  appId: "1:36539597641:web:904bc16bd6e029bb9e5098",
  measurementId: "G-DBK8C1GZR5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, app };
export default app;
