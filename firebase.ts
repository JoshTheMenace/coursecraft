// app/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDBBwywI7EUWaq67FWFQ23sB193G_ZUA04",
  authDomain: "coursecraft-c7a0d.firebaseapp.com",
  projectId: "coursecraft-c7a0d",
  storageBucket: "coursecraft-c7a0d.firebasestorage.app",
  messagingSenderId: "817358092223",
  appId: "1:817358092223:web:3edf26d98d834b884a530a"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
