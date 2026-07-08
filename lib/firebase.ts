import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCRurcIHTgb6yLj2Z5SgI0jScHadQetHnQ",
  authDomain: "work-40887.firebaseapp.com",
  projectId: "work-40887",
  storageBucket: "work-40887.firebasestorage.app",
  messagingSenderId: "61320516893",
  appId: "1:61320516893:web:b6d73fc714ff45ad3fbdf4",
  measurementId: "G-VG80QTY5GP"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const storage = getStorage(app);

// Configure Storage to fail fast (2 seconds max retry) if pricing plan is not upgraded
storage.maxUploadRetryTime = 2000;
storage.maxOperationRetryTime = 2000;

const db = getFirestore(app);

export { app, auth, storage, db };
