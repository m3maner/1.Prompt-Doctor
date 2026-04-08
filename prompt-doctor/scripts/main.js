// ===== MAIN.JS - Shared utilities =====

// Loading overlay
window.addEventListener('load', () => {
  setTimeout(() => {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) overlay.classList.add('hidden');
  }, 1200);
});

// Navbar hamburger
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
}

// Active nav link
const currentPage = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(a => {
  if (a.getAttribute('href') === currentPage) a.classList.add('active');
});

// Toast notification
function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) { toast = document.createElement('div'); toast.className = 'toast'; document.body.appendChild(toast); }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// Copy to clipboard
function copyText(text) {
  navigator.clipboard.writeText(text).then(() => showToast('✓ Copied to clipboard'));
}

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; } });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .testimonial-card, .template-card, .tip-card').forEach(el => {
  el.style.opacity = '0'; el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});
