import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"; 
// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDc3m6FXfo-CGTjdaByF-RlI8Me49Q2c4k",
  authDomain: "adminrapollo.firebaseapp.com",
  projectId: "adminrapollo",
  storageBucket: "adminrapollo.appspot.com",
  messagingSenderId: "652848454297",
  appId: "1:652848454297:web:ccd9f5cd641a81cf543608",
  measurementId: "G-FDG6Z65MF4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
// Export Firebase instances
export { app, auth,db };

export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in: ", error.message);
    return null;
  }
};
