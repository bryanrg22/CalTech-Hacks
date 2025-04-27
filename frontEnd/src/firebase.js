import { initializeApp }   from 'firebase/app';
import { getFirestore, collection } from 'firebase/firestore';
import { getAuth        } from 'firebase/auth';
import { getStorage     } from 'firebase/storage';
import { auth, salesCollection } from '../firebase';


const getEnv = (key) => {
  /* Works in Vite, CRA, Next, & Node */
  return (
    import.meta?.env?.[key]          // Vite
    ?? process.env?.[key]            // CRA, Node
  );
};

const firebaseConfig = {
  apiKey:            getEnv('VITE_APIKEY')            || getEnv('REACT_APP_APIKEY')            || getEnv('NEXT_PUBLIC_APIKEY'),
  authDomain:        getEnv('VITE_AUTH_DOMAIN')       || getEnv('REACT_APP_AUTH_DOMAIN')       || getEnv('NEXT_PUBLIC_AUTH_DOMAIN'),
  projectId:         getEnv('VITE_PROJECT_ID')        || getEnv('REACT_APP_PROJECT_ID')        || getEnv('NEXT_PUBLIC_PROJECT_ID'),
  storageBucket:     getEnv('VITE_STORAGE_BUCKET')    || getEnv('REACT_APP_STORAGE_BUCKET')    || getEnv('NEXT_PUBLIC_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_MESSAGING_SENDER_ID')|| getEnv('REACT_APP_MESSAGING_SENDER_ID')|| getEnv('NEXT_PUBLIC_MESSAGING_SENDER_ID'),
  appId:             getEnv('VITE_APP_ID')            || getEnv('REACT_APP_APP_ID')            || getEnv('NEXT_PUBLIC_APP_ID'),
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app)

// Collection references
const salesCollection = collection(db, "sales")
const ordersCollection = collection(db, "orders")
const partsCollection = collection(db, "parts")
const supplyCollection = collection(db, "supply")

export { app, db, auth, storage, salesCollection, ordersCollection, partsCollection, supplyCollection }
