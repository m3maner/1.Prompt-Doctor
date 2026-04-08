// ===== AUTH.JS — Sign In / Sign Up Modal =====

const AUTH_KEY = 'pd_user';

function getUser() {
  return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null');
}

function saveUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

function logout() {
  localStorage.removeItem(AUTH_KEY);
  updateNavAuth();
  showToast('Signed out successfully');
}

// ── Build modal HTML once ──
function createModal() {
  if (document.getElementById('authModal')) return;

  const modal = document.createElement('div');
  modal.id = 'authModal';
  modal.innerHTML = `
    <div class="auth-backdrop" id="authBackdrop"></div>
    <div class="auth-box" id="authBox">
      <button class="auth-close" id="authClose">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>

      <div class="auth-logo">⚕ PROMPT DOCTOR</div>

      <!-- Tabs -->
      <div class="auth-tabs">
        <button class="auth-tab active" data-tab="signin">Sign In</button>
        <button class="auth-tab" data-tab="signup">Get Started</button>
      </div>

      <!-- Sign In Form -->
      <form class="auth-form" id="signinForm">
        <div class="auth-field">
          <label>Email</label>
          <input type="email" id="siEmail" placeholder="you@example.com" autocomplete="email" required />
        </div>
        <div class="auth-field">
          <label>Password</label>
          <input type="password" id="siPassword" placeholder="Enter your password" autocomplete="current-password" required />
        </div>
        <div class="auth-error" id="siError"></div>
        <button type="submit" class="auth-submit">Sign In</button>
        <p class="auth-switch">Don't have an account? <span onclick="switchTab('signup')">Get Started →</span></p>
      </form>

      <!-- Sign Up Form -->
      <form class="auth-form hidden" id="signupForm">
        <div class="auth-field">
          <label>Full Name</label>
          <input type="text" id="suName" placeholder="Your name" autocomplete="name" required />
        </div>
        <div class="auth-field">
          <label>Email</label>
          <input type="email" id="suEmail" placeholder="you@example.com" autocomplete="email" required />
        </div>
        <div class="auth-field">
          <label>Password</label>
          <input type="password" id="suPassword" placeholder="Create a password (min 6 chars)" autocomplete="new-password" required />
        </div>
        <div class="auth-error" id="suError"></div>
        <button type="submit" class="auth-submit">Create Account</button>
        <p class="auth-switch">Already have an account? <span onclick="switchTab('signin')">Sign In →</span></p>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  // Close handlers
  document.getElementById('authClose').addEventListener('click', closeModal);
  document.getElementById('authBackdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // Tab switching
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Sign In submit
  document.getElementById('signinForm').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('siEmail').value.trim();
    const password = document.getElementById('siPassword').value;
    const users = JSON.parse(localStorage.getItem('pd_users') || '{}');
    const errEl = document.getElementById('siError');

    if (!users[email]) { errEl.textContent = 'No account found with this email.'; return; }
    if (users[email].password !== btoa(password)) { errEl.textContent = 'Incorrect password.'; return; }

    errEl.textContent = '';
    saveUser({ name: users[email].name, email });
    closeModal();
    updateNavAuth();
    showToast(`Welcome back, ${users[email].name.split(' ')[0]}!`);
  });

  // Sign Up submit
  document.getElementById('signupForm').addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('suName').value.trim();
    const email = document.getElementById('suEmail').value.trim();
    const password = document.getElementById('suPassword').value;
    const errEl = document.getElementById('suError');
    const users = JSON.parse(localStorage.getItem('pd_users') || '{}');

    if (password.length < 6) { errEl.textContent = 'Password must be at least 6 characters.'; return; }
    if (users[email]) { errEl.textContent = 'An account with this email already exists.'; return; }

    users[email] = { name, password: btoa(password) };
    localStorage.setItem('pd_users', JSON.stringify(users));
    errEl.textContent = '';
    saveUser({ name, email });
    closeModal();
    updateNavAuth();
    showToast(`Welcome to Prompt Doctor, ${name.split(' ')[0]}!`);
  });
}

function openModal(tab = 'signin') {
  createModal();
  switchTab(tab);
  document.getElementById('authModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    // Clear errors
    ['siError','suError'].forEach(id => { const el = document.getElementById(id); if(el) el.textContent = ''; });
  }
}

function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.getElementById('signinForm').classList.toggle('hidden', tab !== 'signin');
  document.getElementById('signupForm').classList.toggle('hidden', tab !== 'signup');
}

// ── Update navbar buttons based on auth state ──
function updateNavAuth() {
  const user = getUser();
  document.querySelectorAll('.nav-btn-signin').forEach(btn => {
    if (user) {
      btn.textContent = user.name.split(' ')[0];
      btn.onclick = logout;
    } else {
      btn.textContent = 'Sign In';
      btn.onclick = () => openModal('signin');
    }
  });
  document.querySelectorAll('.nav-btn-getstarted').forEach(btn => {
    if (user) {
      btn.textContent = 'Sign Out';
      btn.onclick = logout;
    } else {
      btn.textContent = 'Get Started';
      btn.onclick = () => openModal('signup');
    }
  });

  // Update dashboard profile name if on dashboard
  const profileName = document.getElementById('profileName');
  if (profileName && user) profileName.textContent = user.name;
  const profileAvatar = document.getElementById('profileAvatar');
  if (profileAvatar && user) profileAvatar.textContent = user.name.charAt(0).toUpperCase();
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  // Wire up navbar buttons
  document.querySelectorAll('.btn-ghost').forEach(btn => {
    btn.classList.add('nav-btn-signin');
    btn.addEventListener('click', () => {
      const user = getUser();
      user ? logout() : openModal('signin');
    });
  });
  document.querySelectorAll('.btn-gold').forEach(btn => {
    if (btn.classList.contains('btn-analyze')) return; // skip analyze button
    btn.classList.add('nav-btn-getstarted');
    btn.addEventListener('click', () => {
      const user = getUser();
      user ? logout() : openModal('signup');
    });
  });
  updateNavAuth();
});
