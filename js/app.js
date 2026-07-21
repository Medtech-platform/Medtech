// ═══════════════════════════════════════════════════════════
// MIND+MACHINE — PLATFORM SHELL
// Loads each module as its own partial file (partials/<id>.html)
// into #module-content. Keeps every module's markup in its own
// file so modules can be edited independently.
// ═══════════════════════════════════════════════════════════

const MM = (() => {
  const titles = {
    'dashboard': 'Dashboard',
    'market-understanding': 'Market Understanding',
    'opportunity-clustering': 'Opportunity Clustering',
    'competitor-assessment': 'Competitor Assessment',
    'product-assessment': 'Product Assessment',
    'regional-market': 'Regional Market',
    'innovation-tech': 'Innovation & Tech',
    'market-sizing': 'Market Sizing',
    'kol-interviews': 'KOL Interviews',
    'quant-survey': 'Quantitative Survey',
    'signal-consolidation': 'Signal Consolidation',
    'opportunity-scoring': 'Opportunity Scoring',
    'strategic-recommendations': 'Strategic Recommendations',
    'intel-daily': 'Intel Daily',
    'ai-agent': 'AI Intelligence Engine',
    'admin': 'Admin & Settings',
  };

  const partialCache = {};
  let currentModule = null;

  async function showSection(id) {
    const container = document.getElementById('module-content');
    container.innerHTML = '<div class="empty-state"><p>Loading…</p></div>';

    document.querySelectorAll('#sidebar-nav a').forEach((a) => a.classList.remove('active'));
    document.querySelectorAll(`#sidebar-nav a[data-nav="${id}"]`).forEach((a) => a.classList.add('active'));
    document.getElementById('topbar-title').textContent = titles[id] || id;

    try {
      if (!partialCache[id]) {
        const res = await fetch(`partials/${id}.html`);
        partialCache[id] = await res.text();
      }
      container.innerHTML = partialCache[id];
    } catch (e) {
      container.innerHTML = '<div class="empty-state"><p>Could not load this module.</p></div>';
    }

    currentModule = id;
    document.dispatchEvent(new CustomEvent('mm:module-loaded', { detail: { id } }));

    if (window.innerWidth < 900) document.getElementById('sidebar').classList.remove('open');
  }

  function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
  }

  function toast(msg) {
    const t = document.getElementById('id-toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3200);
  }

  // ── Generic delegated UI behavior shared across modules ──
  document.addEventListener('click', (e) => {
    const navEl = e.target.closest('[data-nav]');
    if (navEl) {
      e.preventDefault();
      showSection(navEl.getAttribute('data-nav'));
      return;
    }

    const likertEl = e.target.closest('[data-likert]');
    if (likertEl) {
      likertEl.closest('.likert-scale').querySelectorAll('.likert-btn').forEach((b) => b.classList.remove('selected'));
      likertEl.classList.add('selected');
      return;
    }

    const surveyEl = e.target.closest('[data-survey-opt]');
    if (surveyEl) {
      surveyEl.closest('.survey-question').querySelectorAll('.survey-option').forEach((o) => o.classList.remove('selected'));
      surveyEl.classList.add('selected');
      return;
    }

    const tabBtn = e.target.closest('[data-id-tab-btn]');
    if (tabBtn) {
      document.dispatchEvent(new CustomEvent('mm:id-show-tab', { detail: { tab: tabBtn.getAttribute('data-id-tab-btn') } }));
      return;
    }

    if (e.target.id === 'admin-apply-client') {
      const val = document.getElementById('admin-client-name').value;
      document.getElementById('client-name').textContent = val;
      return;
    }

    if (e.target.id === 'admin-deploy-netlify') {
      toast('See the README that ships with this project for step-by-step Netlify deployment.');
      return;
    }

    const modToggle = e.target.closest('[data-module-toggle]');
    if (modToggle) {
      const modId = modToggle.getAttribute('data-module-toggle');
      document.querySelectorAll(`#sidebar-nav a[data-nav="${modId}"]`).forEach((a) => {
        a.style.display = modToggle.checked ? '' : 'none';
      });
      return;
    }

    if (e.target.id === 'chat-send') {
      sendChat();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.target.id === 'chat-input' && e.key === 'Enter') sendChat();
  });

  document.getElementById('hamburger').addEventListener('click', toggleSidebar);

  // ── Dashboard-only mock chat (illustrative, no backend) ──
  const chatResponses = [
    'Based on triangulated signals across your KOL interviews and survey responses, the top unmet need is <strong>EMR/workflow integration</strong> — cited by 38% of respondents.',
    'Comparing Medtronic vs Abbott in remote cardiac monitoring: Medtronic leads on installed base, Abbott is moving via its biosensor line. The gap is in ambulatory AI-assisted interpretation.',
    'Signal synthesis: Top 3 signals: (1) Workflow friction is the #1 adoption barrier, (2) AI accuracy is table-stakes not a differentiator, (3) Reimbursement clarity in APAC markets is 12–18 months away.',
    'Opportunity scoring update: Cardiac Remote Monitoring scores 8.7/10 — highest confidence across all 5 scoring dimensions. Recommend a GO decision with a Q2 mobilization timeline.',
  ];
  let chatIdx = 0;
  function sendChat() {
    const input = document.getElementById('chat-input');
    const msgs = document.getElementById('chat-messages');
    if (!input || !msgs) return;
    const val = input.value.trim();
    if (!val) return;
    msgs.innerHTML += `<div class="chat-msg msg-user"><div class="msg-avatar">👤</div><div class="msg-bubble">${val.replace(/</g, '&lt;')}</div></div>`;
    input.value = '';
    msgs.scrollTop = msgs.scrollHeight;
    setTimeout(() => {
      msgs.innerHTML += `<div class="chat-msg msg-ai"><div class="msg-avatar">🧠</div><div class="msg-bubble">${chatResponses[chatIdx++ % chatResponses.length]}</div></div>`;
      msgs.scrollTop = msgs.scrollHeight;
    }, 800);
  }

  return { showSection, toggleSidebar, toast, getCurrentModule: () => currentModule };
})();

window.addEventListener('DOMContentLoaded', () => MM.showSection('dashboard'));
