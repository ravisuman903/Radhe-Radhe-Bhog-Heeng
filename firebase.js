// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDHFc3TuBAjAhAWrmVzQdX5eLFoKTYulmI",
  authDomain: "radhe-radhe-bhog-heeng.firebaseapp.com",
  projectId: "radhe-radhe-bhog-heeng",
  storageBucket: "radhe-radhe-bhog-heeng.firebasestorage.app",
  messagingSenderId: "438530440845",
  appId: "1:438530440845:web:c222af6c9319d2690bacc4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

console.log("✅ Firebase Connected Successfully");
