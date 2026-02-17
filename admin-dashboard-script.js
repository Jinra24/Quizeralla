// Admin Dashboard Script - Firebase Backend

let auth, database;
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Initialize Firebase and check admin access
document.addEventListener('DOMContentLoaded', async () => {
  // Wait for Firebase to initialize
  let maxWait = 50;
  while ((!window.firebaseServices || !window.firebaseServices.auth) && maxWait > 0) {
    await new Promise(r => setTimeout(r, 100));
    maxWait--;
  }

  if (!window.firebaseServices) {
    console.error('Firebase not initialized');
    window.location.href = 'index.html';
    return;
  }

  auth = window.firebaseServices.auth;
  database = window.firebaseServices.database;

  // Check if user is logged in and is admin
  auth.onAuthStateChanged(user => {
    if (!user || !currentUser || !currentUser.isAdmin) {
      window.location.href = 'index.html';
      return;
    }

    initializeAdminDashboard();
  });
});

function initializeAdminDashboard() {
  const name = currentUser.name.split(' ')[0];
  document.getElementById('adminDisplay').textContent = name;

  updateAdminDashboard();

  const userCreateForm = document.getElementById('userCreateForm');
  if (userCreateForm) {
    userCreateForm.addEventListener('submit', handleCreateUser);
  }
}

function updateAdminDashboard() {
  database.ref('users').once('value', snapshot => {
    const usersData = snapshot.val() || {};
    const users = Object.values(usersData);
    const admins = users.filter(u => u.isAdmin);

    document.getElementById('totalUsers').textContent = users.length;
    document.getElementById('totalAdmins').textContent = admins.length;
    document.getElementById('activeUsers').textContent = users.length;

    // Populate user table
    const tableBody = document.getElementById('userTableBody');
    tableBody.innerHTML = '';

    Object.keys(usersData).forEach(uid => {
      const user = usersData[uid];
      const row = document.createElement('tr');
      const joinDate = new Date(user.createdAt).toLocaleDateString();
      const roleClass = user.isAdmin ? 'admin' : 'user';
      const roleText = user.isAdmin ? 'Admin' : 'User';

      let actionButtons = '<span style="color: #999;">-</span>';
      
      if (uid !== currentUser.uid) {
        const removeAdminBtn = user.isAdmin ? `<button class="btn-remove-admin" onclick="removeAdmin('${uid}')">Remove Admin</button>` : '';
        const deleteBtn = `<button class="btn-delete-user" onclick="deleteUser('${uid}')" style="margin-left: 5px;">Delete</button>`;
        actionButtons = removeAdminBtn + deleteBtn;
      }

      row.innerHTML = `
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td><span class="user-role ${roleClass}">${roleText}</span></td>
        <td>${joinDate}</td>
        <td>${actionButtons}</td>
      `;
      tableBody.appendChild(row);
    });
  });
}

function handleCreateUser(e) {
  e.preventDefault();

  const name = document.getElementById('newUserName').value.trim();
  const email = document.getElementById('newUserEmail').value.trim();
  const password = document.getElementById('newUserPassword').value;
  const role = document.getElementById('userRole').value;

  if (!name || !email || !password) {
    alert('Please fill in all fields');
    return;
  }

  if (password.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }

  // Create user with Firebase Authentication
  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      const uid = userCredential.user.uid;

      // Store user data in Realtime Database
      database.ref('users/' + uid).set({
        name: name,
        email: email,
        isAdmin: role === 'admin',
        createdAt: new Date().toISOString()
      })
        .then(() => {
          document.getElementById('userCreateForm').reset();
          updateAdminDashboard();
          alert('Account created successfully!');
        })
        .catch(err => {
          console.error('Error saving user data:', err);
          alert('Error saving user data: ' + err.message);
        });
    })
    .catch(error => {
      if (error.code === 'auth/email-already-in-use') {
        alert('Email already registered. Please use a different email.');
      } else {
        alert('Error creating account: ' + error.message);
      }
    });
}

function removeAdmin(uid) {
  if (confirm('Are you sure you want to remove this admin role?')) {
    database.ref('users/' + uid).update({ isAdmin: false })
      .then(() => {
        updateAdminDashboard();
        alert('Admin role removed successfully!');
      })
      .catch(err => {
        console.error('Error removing admin:', err);
        alert('Error: ' + err.message);
      });
  }
}

function deleteUser(uid) {
  if (confirm('Are you sure you want to delete this user? This cannot be undone.')) {
    // Delete from database
    database.ref('users/' + uid).remove()
      .then(() => {
        updateAdminDashboard();
        alert('User deleted successfully!');
      })
      .catch(err => {
        console.error('Error deleting user:', err);
        alert('Error: ' + err.message);
      });
  }
}

function logout() {
  auth.signOut()
    .then(() => {
      localStorage.removeItem('currentUser');
      window.location.href = 'index.html';
    })
    .catch(err => {
      console.error('Logout error:', err);
      localStorage.removeItem('currentUser');
      window.location.href = 'index.html';
    });
}
