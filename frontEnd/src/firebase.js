// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getFirestore, collection } from "firebase/firestore"
import { getAuth } from "firebase/auth"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCel2lcphKfP3ruLV5v-P9aRtgVhnjI7uI",
  authDomain: "hacktech-cce3f.firebaseapp.com",
  projectId: "hacktech-cce3f",
  storageBucket: "hacktech-cce3f.firebasestorage.app",
  messagingSenderId: "486964013965",
  appId: "1:486964013965:web:57a52ce5fcc5de9e47ebc4",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

// Collection references
const salesCollection = collection(db, "sales")
const ordersCollection = collection(db, "orders")
const partsCollection = collection(db, "parts")
const supplyCollection = collection(db, "supply")

export { app, db, auth, salesCollection, ordersCollection, partsCollection, supplyCollection }
