// Admin Dashboard Script

let users = JSON.parse(localStorage.getItem('users')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Check if user is logged in and is admin
document.addEventListener('DOMContentLoaded', () => {
  if (!currentUser) {
    // Redirect to login if not logged in
    window.location.href = 'index.html';
    return;
  }

  if (!currentUser.isAdmin) {
    // Redirect to user dashboard if not admin
    window.location.href = 'dashboard.html';
    return;
  }

  // Initialize admin dashboard
  initializeAdminDashboard();
});

function initializeAdminDashboard() {
  const name = currentUser.name.split(' ')[0];
  document.getElementById('adminDisplay').textContent = name;

  // Update stats and user table
  updateAdminDashboard();

  // Attach form listener
  const userCreateForm = document.getElementById('userCreateForm');
  if (userCreateForm) {
    userCreateForm.addEventListener('submit', handleCreateUser);
  }
}

function updateAdminDashboard() {
  const totalUsers = users.length;
  const admins = users.filter(u => u.isAdmin);
  const totalAdmins = admins.length;

  document.getElementById('totalUsers').textContent = totalUsers;
  document.getElementById('totalAdmins').textContent = totalAdmins;
  document.getElementById('activeUsers').textContent = totalUsers;

  // Populate user table
  const tableBody = document.getElementById('userTableBody');
  tableBody.innerHTML = '';

  users.forEach(user => {
    const row = document.createElement('tr');
    const joinDate = new Date(user.createdAt).toLocaleDateString();
    const roleClass = user.isAdmin ? 'admin' : 'user';
    const roleText = user.isAdmin ? 'Admin' : 'User';

    let actionButtons = '<span style="color: #999;">-</span>';
    
    if (user.id !== currentUser.id) {
      const removeAdminBtn = user.isAdmin ? `<button class="btn-remove-admin" onclick="removeAdmin(${user.id})">Remove Admin</button>` : '';
      const deleteBtn = `<button class="btn-delete-user" onclick="deleteUser(${user.id})" style="margin-left: 5px;">Delete</button>`;
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
}

function handleCreateUser(e) {
  e.preventDefault();

  const name = document.getElementById('newUserName').value.trim();
  const email = document.getElementById('newUserEmail').value.trim();
  const password = document.getElementById('newUserPassword').value;
  const role = document.getElementById('userRole').value;

  // Validation
  if (!name || !email || !password) {
    alert('Please fill in all fields');
    return;
  }

  if (password.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }

  // Check if email already exists
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    alert('Email already registered. Please use a different email.');
    return;
  }

  // Create new user
  const newUser = {
    id: Date.now(),
    name: name,
    email: email,
    password: password,
    isAdmin: role === 'admin' ? true : false,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  // Clear form
  document.getElementById('userCreateForm').reset();

  // Refresh admin dashboard
  updateAdminDashboard();

  alert('Account created successfully!');
}

function removeAdmin(userId) {
  if (confirm('Are you sure you want to remove this admin role?')) {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.isAdmin = false;
      localStorage.setItem('users', JSON.stringify(users));
      updateAdminDashboard();
    }
  }
}

function deleteUser(userId) {
  if (confirm('Are you sure you want to delete this user? This cannot be undone.')) {
    users = users.filter(u => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(users));
    updateAdminDashboard();
    alert('User deleted successfully!');
  }
}

function logout() {
  currentUser = null;
  localStorage.removeItem('currentUser');
  window.location.href = 'index.html';
}
