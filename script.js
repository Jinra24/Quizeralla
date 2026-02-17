// Login/Signup Functionality - CLEAN VERSION
let users = [];
let currentUser = null;

window.addEventListener('load', function() {
  users = JSON.parse(localStorage.getItem('users')) || [];
  currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

  // Create default admin if none exists
  if (users.length === 0) {
    const adminUser = {
      id: Date.now(),
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      isAdmin: true,
      createdAt: new Date().toISOString()
    };
    users.push(adminUser);
    localStorage.setItem('users', JSON.stringify(users));
  }

  // Redirect if already logged in
  if (currentUser) {
    if (currentUser.isAdmin) {
      window.location.href = 'admin-dashboard.html';
    } else {
      window.location.href = 'dashboard.html';
    }
    return;
  }

  // Attach event listeners
  const loginForm = document.getElementById('loginForm');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});

function handleLogin(e) {
  e.preventDefault();
  clearErrors();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('loginError');

  if (!email || !password) {
    showError(errorEl, 'Please fill in all fields');
    return;
  }

  users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    showError(errorEl, 'Email not found. Try admin@example.com / admin123 or refresh the page');
    return;
  }

  if (user.password !== password) {
    showError(errorEl, 'Incorrect password');
    return;
  }

  // Login successful
  currentUser = user;
  localStorage.setItem('currentUser', JSON.stringify(currentUser));

  if (currentUser.isAdmin) {
    window.location.href = 'admin-dashboard.html';
  } else {
    window.location.href = 'dashboard.html';
  }
}

function handleSignup(e) {
  e.preventDefault();
  clearErrors();

  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const errorEl = document.getElementById('signupError');

  if (!name || !email || !password || !confirmPassword) {
    showError(errorEl, 'All fields are required');
    return;
  }

  if (password.length < 6) {
    showError(errorEl, 'Password must be at least 6 characters');
    return;
  }

  if (password !== confirmPassword) {
    showError(errorEl, 'Passwords do not match');
    return;
  }

  users = JSON.parse(localStorage.getItem('users')) || [];
  
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    showError(errorEl, 'Email already registered');
    return;
  }

  const newUser = {
    id: Date.now(),
    name: name,
    email: email,
    password: password,
    isAdmin: false,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));

  currentUser = newUser;
  localStorage.setItem('currentUser', JSON.stringify(currentUser));

  document.getElementById('signupForm').reset();
  window.location.href = 'dashboard.html';
}

function switchToSignup(event) {
  if (event) event.preventDefault();
  document.getElementById('loginPage').classList.remove('active');
  document.getElementById('signupPage').classList.add('active');
  clearErrors();
}

function switchToLogin(event) {
  if (event) event.preventDefault();
  document.getElementById('loginPage').classList.add('active');
  document.getElementById('signupPage').classList.remove('active');
  clearErrors();
}

function showError(element, message) {
  if (!element) return;
  element.textContent = message;
  element.classList.add('show');
}

function clearErrors() {
  const loginError = document.getElementById('loginError');
  const signupError = document.getElementById('signupError');

  if (loginError) {
    loginError.textContent = '';
    loginError.classList.remove('show');
  }
  if (signupError) {
    signupError.textContent = '';
    signupError.classList.remove('show');
  }
}
