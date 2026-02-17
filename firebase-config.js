// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBTIqGWFbb8C-bMJEk8KXTzHBDvzd1atGE",
  authDomain: "quizeralla.firebaseapp.com",
  databaseURL: "https://quizeralla-default-rtdb.firebaseio.com",
  projectId: "quizeralla",
  storageBucket: "quizeralla.firebasestorage.app",
  messagingSenderId: "237289223240",
  appId: "1:237289223240:web:3fedc5517e620c91b1d47d"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Realtime Database
const auth = firebase.auth();
const database = firebase.database();

// Export for use in other scripts
window.firebaseServices = {
  auth,
  database
};
