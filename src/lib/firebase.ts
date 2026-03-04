import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB0va32HBH_Uczxvr7CXJT-de6CmneSzlE",
    authDomain: "greensync-427fb.firebaseapp.com",
    projectId: "greensync-427fb",
    storageBucket: "greensync-427fb.firebasestorage.app",
    messagingSenderId: "416839359087",
    appId: "1:416839359087:web:aab21abcde28647fb1cb9a",
    measurementId: "G-0EB9XLQ5ZC"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
