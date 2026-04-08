// ===== DASHBOARD.JS =====

function renderHistory() {
  const history = JSON.parse(localStorage.getItem('pd_history') || '[]');
  const list = document.getElementById('historyList');
  if (!list) return;

  if (history.length === 0) {
    list.innerHTML = '<p style="color:var(--text-muted);font-size:0.875rem;padding:20px 0;">No prompts analyzed yet. <a href="index.html" style="color:var(--gold)">Analyze your first prompt →</a></p>';
  } else {
    list.innerHTML = history.map((item) => `
      <div class="history-item">
        <div class="history-score">${item.score}</div>
        <div class="history-content">
          <div class="history-prompt">${escapeHtml(item.prompt)}</div>
          <div class="history-meta">${item.date} · Score: ${item.score}/10</div>
        </div>
        <div class="history-actions">
          <button class="icon-btn" title="Copy" onclick="copyText(${JSON.stringify(item.prompt)})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
          <button class="icon-btn" title="Reuse" onclick="reusePrompt(${JSON.stringify(item.prompt)})">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </button>
        </div>
      </div>
    `).join('');
  }

  // Stats
  const avg = history.length ? Math.round(history.reduce((s, i) => s + i.score, 0) / history.length) : null;
  const best = history.length ? Math.max(...history.map(i => i.score)) : null;

  setEl('avgScore',    avg  ?? '—');
  setEl('totalPrompts', history.length);
  setEl('statTotal',   history.length);
  setEl('statAvg',     avg  ?? '—');
  setEl('statBest',    best ?? '—');
  setEl('statWeek',    history.slice(0, 7).length);

  // Defer chart until layout is ready
  requestAnimationFrame(() => renderChart(history));
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function reusePrompt(text) {
  localStorage.setItem('pd_reuse', text);
  window.location.href = 'index.html';
}

function renderChart(history) {
  const canvas = document.getElementById('scoreChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const data = history.slice(0, 10).reverse();

  // Use parent width for proper sizing
  const parent = canvas.parentElement;
  const w = canvas.width = parent ? parent.clientWidth - 56 : 600;
  const h = canvas.height = 180;
  ctx.clearRect(0, 0, w, h);

  const pad = { top: 16, right: 16, bottom: 24, left: 32 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;

  // Y-axis labels
  ctx.fillStyle = 'rgba(160,160,160,0.6)';
  ctx.font = '10px Inter, sans-serif';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 5; i++) {
    const val = i * 2;
    const y = pad.top + chartH - (val / 10) * chartH;
    ctx.fillText(val, pad.left - 6, y + 3);
    ctx.strokeStyle = 'rgba(212,175,55,0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(w - pad.right, y); ctx.stroke();
  }

  if (data.length === 0) {
    ctx.fillStyle = 'rgba(160,160,160,0.3)';
    ctx.textAlign = 'center';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText('No data yet — analyze some prompts!', w / 2, h / 2);
    return;
  }

  const step = data.length > 1 ? chartW / (data.length - 1) : chartW;

  const pts = data.map((d, i) => ({
    x: pad.left + (data.length > 1 ? i * step : chartW / 2),
    y: pad.top + chartH - (d.score / 10) * chartH
  }));

  // Gradient fill
  const grad = ctx.createLinearGradient(0, pad.top, 0, h - pad.bottom);
  grad.addColorStop(0, 'rgba(212,175,55,0.25)');
  grad.addColorStop(1, 'rgba(212,175,55,0)');
  ctx.beginPath();
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.lineTo(pts[pts.length - 1].x, h - pad.bottom);
  ctx.lineTo(pts[0].x, h - pad.bottom);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  pts.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
  ctx.stroke();

  // Dots + score labels
  pts.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#0A0A0A';
    ctx.fill();
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = 'rgba(212,175,55,0.9)';
    ctx.font = 'bold 10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(data[i].score, p.x, p.y - 10);
  });
}

// Sidebar tab switching
document.querySelectorAll('.sidebar-link').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
  });
});

document.addEventListener('DOMContentLoaded', renderHistory);

window.addEventListener('resize', () => {
  const history = JSON.parse(localStorage.getItem('pd_history') || '[]');
  renderChart(history);
});
