// ===== ANALYZER.JS - AI Prompt Analysis Engine =====

const analyzeBtn = document.getElementById('analyzeBtn');
const promptInput = document.getElementById('promptInput');
const charCount = document.getElementById('charCount');
const resultsPanel = document.getElementById('resultsPanel');

if (promptInput) {
  promptInput.addEventListener('input', () => {
    const len = promptInput.value.length;
    charCount.textContent = `${len} characters`;
  });
}

function analyzePrompt(text) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

  // Scoring logic
  let clarityScore = 5;
  let creativityScore = 5;
  let structureScore = 5;
  const issues = [];

  // Length checks
  if (wordCount < 5) { clarityScore -= 3; issues.push({ type: 'error', msg: 'Prompt is too short. Add more context and detail.' }); }
  else if (wordCount < 15) { clarityScore -= 1; issues.push({ type: 'warning', msg: 'Prompt could benefit from more detail and specificity.' }); }
  else if (wordCount > 200) { structureScore -= 1; issues.push({ type: 'info', msg: 'Prompt is quite long. Consider breaking it into focused sections.' }); }

  // Vagueness checks
  const vagueWords = ['something', 'stuff', 'things', 'good', 'nice', 'better', 'make', 'do', 'create'];
  const foundVague = vagueWords.filter(w => text.toLowerCase().includes(w));
  if (foundVague.length > 2) { clarityScore -= 1; issues.push({ type: 'warning', msg: `Vague words detected: "${foundVague.slice(0,3).join('", "')}". Use specific, descriptive language.` }); }

  // Question marks / instructions
  if (!text.includes('?') && !text.match(/\b(write|create|generate|explain|describe|list|analyze|summarize|help|tell)\b/i)) {
    structureScore -= 1; issues.push({ type: 'warning', msg: 'No clear instruction or action verb found. Start with a directive like "Write", "Explain", or "Generate".' });
  }

  // Context check
  if (!text.match(/\b(for|because|to|in order to|so that|as a|like a)\b/i) && wordCount < 30) {
    structureScore -= 1; issues.push({ type: 'info', msg: 'Consider adding context: who is the audience, what is the purpose?' });
  }

  // Creativity boost
  const creativeWords = ['creative', 'unique', 'innovative', 'original', 'imaginative', 'story', 'poem', 'design', 'concept'];
  if (creativeWords.some(w => text.toLowerCase().includes(w))) creativityScore += 1;
  if (wordCount > 30) creativityScore += 1;
  if (sentences.length > 2) { structureScore += 1; creativityScore += 1; }

  // Clamp scores
  clarityScore = Math.max(1, Math.min(10, clarityScore + Math.floor(wordCount / 10)));
  creativityScore = Math.max(1, Math.min(10, creativityScore));
  structureScore = Math.max(1, Math.min(10, structureScore));
  const overall = Math.round((clarityScore + creativityScore + structureScore) / 3);

  // Generate improved prompt
  const improved = generateImproved(text, words);
  const creative = generateCreative(text, words);

  return { overall, clarityScore, creativityScore, structureScore, issues, improved, creative };
}

function generateImproved(text, words) {
  let improved = text.trim();
  // Capitalize first letter
  improved = improved.charAt(0).toUpperCase() + improved.slice(1);
  // Add period if missing
  if (!/[.!?]$/.test(improved)) improved += '.';
  // Add context wrapper if short
  if (words.length < 20) {
    improved = `Please provide a detailed and comprehensive response to the following: ${improved} Include relevant examples, key considerations, and actionable insights. Format the response clearly with structured sections where appropriate.`;
  } else {
    improved = `${improved} Please ensure the response is detailed, well-structured, and includes practical examples. Consider multiple perspectives and provide actionable recommendations.`;
  }
  return improved;
}

function generateCreative(text, words) {
  const starters = [
    'Imagine you are a world-class expert with 20 years of experience.',
    'As a visionary thought leader in this domain,',
    'Drawing from cutting-edge research and creative thinking,',
    'With the precision of a master craftsman and the vision of an innovator,'
  ];
  const starter = starters[Math.floor(Math.random() * starters.length)];
  let core = text.trim().charAt(0).toLowerCase() + text.trim().slice(1);
  if (!/[.!?]$/.test(core)) core += '.';
  return `${starter} ${core} Push beyond conventional boundaries — explore unexpected angles, challenge assumptions, and deliver a response that is both intellectually rigorous and creatively inspiring. Make it memorable, impactful, and uniquely valuable.`;
}

function renderResults(data) {
  const { overall, clarityScore, creativityScore, structureScore, issues, improved, creative } = data;

  // Score ring
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (overall / 10) * circumference;
  document.getElementById('scoreNum').textContent = overall;
  document.getElementById('scoreCircle').style.strokeDashoffset = offset;

  // Bars
  animateBar('clarityBar', clarityScore);
  animateBar('creativityBar', creativityScore);
  animateBar('structureBar', structureScore);

  // Issues
  const issuesList = document.getElementById('issuesList');
  if (issues.length === 0) {
    issuesList.innerHTML = '<li class="issue-item" style="border-color:rgba(74,222,128,0.2);background:rgba(74,222,128,0.06)"><span class="issue-icon">✓</span> No major issues found. Great prompt!</li>';
  } else {
    issuesList.innerHTML = issues.map(i => `<li class="issue-item"><span class="issue-icon">${i.type === 'error' ? '✗' : i.type === 'warning' ? '⚠' : 'ℹ'}</span>${i.msg}</li>`).join('');
  }

  // Improved prompt
  document.getElementById('improvedText').textContent = improved;
  document.getElementById('creativeText').textContent = creative;

  // Copy buttons
  document.getElementById('copyImproved').onclick = () => copyText(improved);
  document.getElementById('copyCreative').onclick = () => copyText(creative);

  resultsPanel.classList.add('visible');
  resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Save to history
  saveToHistory(promptInput.value.trim(), overall);
}

function animateBar(id, score) {
  const bar = document.getElementById(id);
  if (bar) setTimeout(() => { bar.style.width = `${score * 10}%`; }, 100);
}

function saveToHistory(prompt, score) {
  const history = JSON.parse(localStorage.getItem('pd_history') || '[]');
  history.unshift({ prompt, score, date: new Date().toLocaleDateString() });
  if (history.length > 20) history.pop();
  localStorage.setItem('pd_history', JSON.stringify(history));
}

if (analyzeBtn) {
  analyzeBtn.addEventListener('click', () => {
    const text = promptInput.value.trim();
    if (!text) { showToast('Please enter a prompt first'); return; }
    analyzeBtn.classList.add('loading');
    setTimeout(() => {
      analyzeBtn.classList.remove('loading');
      const result = analyzePrompt(text);
      renderResults(result);
    }, 1800);
  });
}
