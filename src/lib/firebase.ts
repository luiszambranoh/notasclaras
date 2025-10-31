// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCoHpBG8mv7R4My6xezHpep7vH5LVbjh2k",
  authDomain: "notas-claras.firebaseapp.com",
  projectId: "notas-claras",
  storageBucket: "notas-claras.firebasestorage.app",
  messagingSenderId: "764055886893",
  appId: "1:764055886893:web:7c086f85ab94fab73e2ca4",
  measurementId: "G-ZMFCVRL7EB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();