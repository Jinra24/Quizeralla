// Firebase Configuration (Compat Version)
const firebaseConfig = {
  apiKey: "AIzaSyBTIqGWFbb8C-bMJEk8KXTzHBDvzd1atGE",
  authDomain: "quizeralla.firebaseapp.com",
  databaseURL: "https://quizeralla-default-rtdb.firebaseio.com",
  projectId: "quizeralla",
  storageBucket: "quizeralla.firebasestorage.app",
  messagingSenderId: "237289223240",
  appId: "1:237289223240:web:3fedc5517e620c91b1d47d"
};

// Wait for Firebase to load, then initialize
function initializeFirebase() {
  if (typeof firebase !== 'undefined') {
    try {
      // Initialize if not already initialized
      if (!firebase.apps || firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
      }
      // Create global services object for easy access
      window.firebaseServices = {
        auth: firebase.auth(),
        database: firebase.database()
      };
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization error:', error);
      // Retry if there was an error
      setTimeout(initializeFirebase, 100);
    }
  } else {
    // Retry if Firebase SDK hasn't loaded yet
    setTimeout(initializeFirebase, 100);
  }
}

// Start initialization
initializeFirebase();
