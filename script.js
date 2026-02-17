// Firebase Authentication - Cloud-based Login
let auth, database;

document.addEventListener('DOMContentLoaded', async () => {
  // Wait for Firebase to initialize
  let maxWait = 50; // 5 seconds
  while ((!window.firebaseServices || !window.firebaseServices.auth) && maxWait > 0) {
    await new Promise(r => setTimeout(r, 100));
    maxWait--;
  }

  if (!window.firebaseServices) {
    console.error('Firebase not initialized. Check firebase-config.js');
    showError(document.getElementById('loginError'), 'Configuration error. Please contact administrator.');
    return;
  }

  auth = window.firebaseServices.auth;
  database = window.firebaseServices.database;

  // Check if user is already logged in
  auth.onAuthStateChanged(user => {
    if (user) {
      database.ref('users/' + user.uid).once('value')
        .then(snapshot => {
          const userData = snapshot.val();
          if (userData && userData.isAdmin) {
            window.location.href = 'admin-dashboard.html';
          } else {
            window.location.href = 'dashboard.html';
          }
        })
        .catch(err => console.error('Error fetching user data:', err));
    }
  });

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Ensure default admin exists
  ensureDefaultAdmin();
});

// Handle Login with Firebase
async function handleLogin(e) {
  e.preventDefault();
  clearErrors();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorElement = document.getElementById('loginError');

  if (!email || !password) {
    showError(errorElement, 'Please enter email and password');
    return;
  }

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    const snapshot = await database.ref('users/' + user.uid).once('value');
    const userData = snapshot.val();

    if (!userData) {
      showError(errorElement, 'User profile not found');
      await auth.signOut();
      return;
    }

    localStorage.setItem('currentUser', JSON.stringify({
      uid: user.uid,
      email: user.email,
      name: userData.name,
      isAdmin: userData.isAdmin
    }));

    if (userData.isAdmin) {
      window.location.href = 'admin-dashboard.html';
    } else {
      window.location.href = 'dashboard.html';
    }
  } catch (error) {
    console.error('Login error:', error);
    if (error.code === 'auth/user-not-found') {
      showError(errorElement, 'Account not found');
    } else if (error.code === 'auth/wrong-password') {
      showError(errorElement, 'Incorrect password');
    } else if (error.code === 'auth/invalid-email') {
      showError(errorElement, 'Invalid email address');
    } else {
      showError(errorElement, error.message);
    }
  }
}

// Ensure default admin exists in Firebase
async function ensureDefaultAdmin() {
  const defaultAdminEmail = 'admin@example.com';
  const defaultAdminPassword = 'admin123';

  try {
    const snapshot = await database.ref('users').once('value');
    const users = snapshot.val();

    let adminExists = false;
    if (users) {
      for (let uid in users) {
        if (users[uid].isAdmin) {
          adminExists = true;
          break;
        }
      }
    }

    if (!adminExists) {
      try {
        const result = await auth.createUserWithEmailAndPassword(defaultAdminEmail, defaultAdminPassword);
        await database.ref('users/' + result.user.uid).set({
          email: defaultAdminEmail,
          name: 'Admin',
          isAdmin: true,
          createdAt: new Date().toISOString()
        });
        console.log('Default admin created');
      } catch (createError) {
        if (createError.code !== 'auth/email-already-in-use') {
          console.log('Admin exists or error:', createError.message);
        }
      }
    }
  } catch (error) {
    console.error('Error with default admin:', error);
  }
}

// Helper functions
function showError(element, message) {
  if (!element) return;
  element.textContent = message;
  element.style.display = 'block';
}

function clearErrors() {
  const errorElements = document.querySelectorAll('.error-message');
  errorElements.forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
}
