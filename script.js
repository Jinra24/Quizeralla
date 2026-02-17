// Firebase Authentication - Cloud-based Login

let globalAuth, globalDatabase;

document.addEventListener('DOMContentLoaded', async () => {
  // Wait for Firebase to initialize
  let maxWait = 50;
  while (!window.firebaseServices || !window.firebaseServices.auth && maxWait > 0) {
    await new Promise(r => setTimeout(r, 100));
    maxWait--;
  }

  if (!window.firebaseServices || !window.firebaseServices.auth) {
    console.error('Firebase not initialized');
    showError(document.getElementById('loginError'), 'Configuration error. Please contact administrator.');
    return;
  }

  globalAuth = window.firebaseServices.auth;
  globalDatabase = window.firebaseServices.database;

  // Check if user is already logged in
  let authCheckExecuted = false;
  globalAuth.onAuthStateChanged(user => {
    if (authCheckExecuted) return; // Prevent multiple redirects
    authCheckExecuted = true;
    
    if (user) {
      globalDatabase.ref('users/' + user.uid).once('value')
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
    const userCredential = await globalAuth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    let snapshot = await globalDatabase.ref('users/' + user.uid).once('value');
    let userData = snapshot.val();

    // If user doesn't exist in database, create their profile
    if (!userData) {
      // Check if this is the admin account (first login)
      const isAdmin = email === 'admin@example.com';
      
      userData = {
        email: user.email,
        name: email === 'admin@example.com' ? 'Admin' : email.split('@')[0],
        isAdmin: isAdmin,
        createdAt: new Date().toISOString()
      };
      
      await globalDatabase.ref('users/' + user.uid).set(userData);
      console.log('✅ User profile created in database');
    }

    localStorage.setItem('currentUser', JSON.stringify({
      uid: user.uid,
      email: user.email,
      name: userData.name,
      isAdmin: userData.isAdmin
    }));

    // Ensure default admin exists (after successful authentication)
    if (userData.isAdmin) {
      await ensureDefaultAdmin();
    }

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

// Global reference for logout
function logout() {
  globalAuth.signOut().then(() => {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
  }).catch(err => console.error('Logout error:', err));
}

// Ensure default admin exists in Firebase
async function ensureDefaultAdmin() {
  const defaultAdminEmail = 'admin@example.com';
  const defaultAdminPassword = 'admin123';

  try {
    // Try to read the users list. If rules block this, fall back to setting
    // the current authenticated user's profile as admin (write to own node
    // is allowed by most rulesets).
    let users = null;
    try {
      const snapshot = await globalDatabase.ref('users').once('value');
      users = snapshot.val();
    } catch (readErr) {
      // Permission denied when reading /users
      console.warn('Could not read /users:', readErr.message || readErr);
      // If we're authenticated, ensure the current user is marked admin
      const me = globalAuth && globalAuth.currentUser;
      if (me) {
        try {
          await globalDatabase.ref('users/' + me.uid).update({
            isAdmin: true,
            email: me.email,
            name: 'Admin'
          });
          console.log('✅ Current user marked as admin (fallback)');
        } catch (updateErr) {
          console.error('Failed to update current user admin flag:', updateErr);
        }
      }
      return;
    }

    let adminExists = false;
    let adminUid = null;
    if (users) {
      for (let uid in users) {
        if (users[uid].isAdmin) {
          adminExists = true;
          adminUid = uid;
          break;
        }
      }
    }

    if (!adminExists) {
      try {
        // If admin email already exists in Auth this will fail; we'll handle that.
        const result = await globalAuth.createUserWithEmailAndPassword(defaultAdminEmail, defaultAdminPassword);
        adminUid = result.user.uid;
        await globalDatabase.ref('users/' + adminUid).set({
          email: defaultAdminEmail,
          name: 'Admin',
          isAdmin: true,
          createdAt: new Date().toISOString()
        });
        console.log('✅ Default admin created successfully');
      } catch (createError) {
        if (createError.code === 'auth/email-already-in-use') {
          // Email exists in Auth but maybe not in database; try to fix DB entry.
          console.log('Admin email exists in Firebase Auth, ensuring DB entry...');
          let foundUid = null;
          if (users) {
            for (let uid in users) {
              if (users[uid].email === defaultAdminEmail) {
                foundUid = uid;
                break;
              }
            }
          }
          if (foundUid) {
            try {
              await globalDatabase.ref('users/' + foundUid).update({ isAdmin: true });
              console.log('✅ Admin account fixed - isAdmin flag updated');
            } catch (uErr) {
              console.error('Failed to update existing user isAdmin flag:', uErr);
            }
          }
        } else {
          console.error('Error creating admin:', createError.message || createError);
        }
      }
    } else {
      console.log('✅ Admin account already exists');
    }
  } catch (error) {
    console.error('Error ensuring default admin:', error);
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
