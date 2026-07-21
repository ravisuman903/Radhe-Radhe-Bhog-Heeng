import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    onSnapshot,
    query,
    where,
    deleteDoc,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ===============================
// FIREBASE CONFIGURATION
// ===============================

const firebaseConfig = {

    apiKey: "AIzaSyDHFc3TuBAjAhAWrmVzQdX5eLFoKTYulmI",

    authDomain:
        "radhe-radhe-bhog-heeng.firebaseapp.com",

    projectId:
        "radhe-radhe-bhog-heeng",

    storageBucket:
        "radhe-radhe-bhog-heeng.firebasestorage.app",

    messagingSenderId:
        "438530440845",

    appId:
        "1:438530440845:web:c222af6c9319d2690bacc4"
};


// ===============================
// INITIALIZE FIREBASE
// ===============================

const app = initializeApp(firebaseConfig);


// ===============================
// INITIALIZE FIRESTORE
// ===============================

const db = getFirestore(app);


// ===============================
// EXPORT FIREBASE FUNCTIONS
// ===============================

export {

    db,

    collection,
    addDoc,
    getDocs,

    onSnapshot,

    query,
    where,

    deleteDoc,
    doc,
    updateDoc

};
