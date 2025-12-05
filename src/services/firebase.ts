import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider,  } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDq2uzCsKivZlGoK4DQcl4t7g_3VA7qas0",
    authDomain: "ladarkask.firebaseapp.com",
    projectId: "ladarkask",
    storageBucket: "ladarkask.firebasestorage.app",
    messagingSenderId: "363077217836",
    appId: "1:363077217836:web:c5f1c42d3faa076c766b89",
    measurementId: "G-1FZ3SR37Y2"
  };

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();