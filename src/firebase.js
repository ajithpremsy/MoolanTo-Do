import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBojRieM6D_vtaaUcr5oIMT5r9XteJfVyY",
    authDomain: "moolan-todo-app-v1.firebaseapp.com",
    projectId: "moolan-todo-app-v1",
    storageBucket: "moolan-todo-app-v1.firebasestorage.app",
    messagingSenderId: "738708112781",
    appId: "1:738708112781:web:59ecf5a52fc6eaca6aa9c4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
