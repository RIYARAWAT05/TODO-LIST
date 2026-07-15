// Auth Theme Setup
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

// DOM Elements
const tabLogin = document.getElementById('tab-login');
const tabSignup = document.getElementById('tab-signup');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const toastContainer = document.getElementById('toast-container');

// Check Session Redirect
if (localStorage.getItem('todo_current_user')) {
    window.location.href = 'INDEX.HTML';
}

// Event Listeners
tabLogin.addEventListener('click', () => switchTab('login'));
tabSignup.addEventListener('click', () => switchTab('signup'));
loginForm.addEventListener('submit', handleLogin);
signupForm.addEventListener('submit', handleSignup);

// Switch between Login and Signup forms
function switchTab(mode) {
    if (mode === 'login') {
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
    } else {
        tabLogin.classList.remove('active');
        tabSignup.classList.add('active');
        loginForm.classList.remove('active');
        signupForm.classList.add('active');
    }
}

// Handle User Signup
function handleSignup(e) {
    e.preventDefault();
    
    const usernameInput = document.getElementById('signup-username').value.trim();
    const emailInput = document.getElementById('signup-email').value.trim();
    const passwordInput = document.getElementById('signup-password').value;
    const confirmPasswordInput = document.getElementById('signup-confirm-password').value;

    // Validations
    if (usernameInput.length < 3) {
        showToast('Username must be at least 3 characters.', 'danger');
        return;
    }
    if (passwordInput.length < 6) {
        showToast('Password must be at least 6 characters.', 'danger');
        return;
    }
    if (passwordInput !== confirmPasswordInput) {
        showToast('Passwords do not match.', 'danger');
        return;
    }

    // Load existing users
    let users = [];
    if (localStorage.getItem('todo_users')) {
        users = JSON.parse(localStorage.getItem('todo_users'));
    }

    // Check duplicate
    const userExists = users.some(u => u.username.toLowerCase() === usernameInput.toLowerCase() || u.email.toLowerCase() === emailInput.toLowerCase());
    if (userExists) {
        showToast('Username or Email already registered.', 'danger');
        return;
    }

    // Create user
    const newUser = {
        username: usernameInput,
        email: emailInput,
        password: passwordInput,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem('todo_users', JSON.stringify(users));
    localStorage.setItem('todo_current_user', JSON.stringify({ username: usernameInput }));

    showToast('Account created successfully! Redirecting...', 'success');
    
    setTimeout(() => {
        window.location.href = 'INDEX.HTML';
    }, 1200);
}

// Handle User Login
function handleLogin(e) {
    e.preventDefault();

    const usernameOrEmail = document.getElementById('login-username').value.trim();
    const passwordInput = document.getElementById('login-password').value;

    let users = [];
    if (localStorage.getItem('todo_users')) {
        users = JSON.parse(localStorage.getItem('todo_users'));
    }

    // Find User
    const user = users.find(u => 
        (u.username.toLowerCase() === usernameOrEmail.toLowerCase() || u.email.toLowerCase() === usernameOrEmail.toLowerCase()) && 
        u.password === passwordInput
    );

    if (user) {
        localStorage.setItem('todo_current_user', JSON.stringify({ username: user.username }));
        showToast('Login successful! Redirecting...', 'success');
        setTimeout(() => {
            window.location.href = 'INDEX.HTML';
        }, 1200);
    } else {
        showToast('Invalid username, email, or password.', 'danger');
    }
}

// Mock Social Authentication
window.mockSocialAuth = function(provider) {
    const mockUser = { username: `${provider}_User` };
    localStorage.setItem('todo_current_user', JSON.stringify(mockUser));
    
    // Add mockup user in stored users list if not exists
    let users = [];
    if (localStorage.getItem('todo_users')) {
        users = JSON.parse(localStorage.getItem('todo_users'));
    }
    if (!users.some(u => u.username === mockUser.username)) {
        users.push({
            username: mockUser.username,
            email: `${provider.toLowerCase()}@mock.com`,
            password: 'mockedpassword',
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('todo_users', JSON.stringify(users));
    }

    showToast(`Logged in successfully via ${provider}! Redirecting...`, 'success');
    setTimeout(() => {
        window.location.href = 'INDEX.HTML';
    }, 1200);
};

// Toast Helper
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fa-solid ${
            type === 'success' ? 'fa-circle-check' : 
            type === 'danger' ? 'fa-circle-exclamation' : 'fa-circle-info'
        }"></i>
        <span>${message}</span>
    `;

    toastContainer.appendChild(toast);
    
    // Trigger slide-in
    setTimeout(() => toast.classList.add('active'), 50);

    // Slide-out and remove
    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
