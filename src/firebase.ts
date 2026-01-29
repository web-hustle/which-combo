import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBU_ZrTqqirAHJOrp_DZd12QfYx3Bkcr10",
    authDomain: "which-combo.firebaseapp.com",
    databaseURL: "https://which-combo-default-rtdb.firebaseio.com",
    projectId: "which-combo",
    storageBucket: "which-combo.firebasestorage.app",
    messagingSenderId: "891755139274",
    appId: "1:891755139274:web:0aedaebd7e1b6565636433",
    measurementId: "G-K3XSKH3SX5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);