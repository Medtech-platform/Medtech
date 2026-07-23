// ═══════════════════════════════════════════════════════════════════════════
// MIND+MACHINE™ — PLATFORM SHELL  |  app.js
// ─────────────────────────────────────────────────────────────────────────
// ARCHITECTURE NOTES (plain English):
//
//  • This file is the "traffic manager" of the whole platform. It:
//      1. Loads each page's content on demand from the /partials/ folder.
//      2. Handles all sidebar/nav/tab interactions through ONE click listener
//         (no duplicate handlers anywhere in the codebase).
//      3. Applies whatever client profile is currently active — logos,
//         report names, colors — WITHOUT ever knowing the client's real
//         name itself. That data lives in client-config.js and in
//         Netlify environment variables, not here.
//      4. Guards every admin-only route. If no client is signed in, the
//         admin area redirects to the login screen.
//
//  • WHAT IS INTENTIONALLY NOT IN THIS FILE:
//      – Any client name (Thermo Fisher, RxBenefits, etc.)
//      – Any password or API key
//      – Any email address
//      – Any competitor name or search string
//      All of that lives in client-config.js which is loaded before this
//      file and populated at runtime from authenticated session state /
//      Netlify environment variables.
//
//  • DRY / SOLID: every repeated pattern (toast, tab switching, module
//    loading) is a single named function. Nothing is copy-pasted.
//
// ═══════════════════════════════════════════════════════════════════════════

const MM = (() => {

  // ─────────────────────────────────────────────────────────────────────────
  // 1.  MODULE REGISTRY
  //     Maps every nav key to its human-readable title.
  //     Report names that are client-specific (e.g. "DNL Daily", "Biweekly")
  //     are NOT hard-coded here — they are filled in by applyClientBranding()
  //     which reads from window.CLIENT_CONFIG (set in client-config.js).
  // ─────────────────────────────────────────────────────────────────────────
  const MODULE_TITLES = {
    'dashboard':                 'Dashboard',
    'market-understanding':      'Market Understanding',
    'opportunity-clustering':    'Opportunity Clustering',
    'competitor-assessment':     'Competitor Assessment',
    'product-assessment':        'Product Assessment',
    'regional-market':           'Regional Market',
    'innovation-tech':           'Innovation & Tech',
    'market-sizing':             'Market Sizing',
    'kol-interviews':            'KOL Interviews',
    'quant-survey':              'Quantitative Survey',
    'signal-consolidation':      'Signal Consolidation',
    'opportunity-scoring':       'Opportunity Scoring',
    'strategic-recommendations': 'Strategic Recommendations',
    'ai-agent':                  'AI Intelligence Engine',
    'admin':                     'Admin & Settings',
    'login':                     'Sign In',
    // Report modules: keys are generic; labels are set per-client at runtime
    'report-primary':            'Daily Report',
    'report-secondary':          'Secondary Report',
    'report-tertiary':           'Tertiary Report',
  };

  // Modules that require a signed-in admin session.
  // Any nav request to these keys is blocked until window.CLIENT_CONFIG exists.
  const ADMIN_ONLY_MODULES = new Set(['admin']);

  // Modules that require ANY client to be signed in (not just admin panel).
  const AUTH_REQUIRED_MODULES = new Set([
    'admin', 'report-primary', 'report-secondary', 'report-tertiary',
    'intel-daily',
  ]);

  // ─────────────────────────────────────────────────────────────────────────
  // 2.  PARTIAL LOADER
  //     Fetches HTML partials from /partials/<id>.html and caches them
  //     in memory so we never fetch the same file twice.
  // ─────────────────────────────────────────────────────────────────────────
  const _partialCache = {};

  async function _fetchPartial(id) {
    if (_partialCache[id]) return _partialCache[id];
    try {
      const res = await fetch(`partials/${id}.html`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      _partialCache[id] = html;
      return html;
    } catch (err) {
      console.warn(`[MM] Could not load partial "${id}":`, err.message);
      return null;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3.  MODULE NAVIGATION
  // ─────────────────────────────────────────────────────────────────────────
  let _currentModule = null;

  async function showSection(id) {
    // ── 3a. Auth guard ─────────────────────────────────────────────────────
    const isSignedIn = !!(window.CLIENT_CONFIG && window.CLIENT_CONFIG.clientKey);

    if (AUTH_REQUIRED_MODULES.has(id) && !isSignedIn) {
      return showSection('login');
    }

    // ── 3b. Update active nav link ─────────────────────────────────────────
    document.querySelectorAll('#sidebar-nav a').forEach((a) => a.classList.remove('active'));
    document.querySelectorAll(`#sidebar-nav a[data-nav="${id}"]`).forEach((a) => a.classList.add('active'));

    // ── 3c. Update topbar title ────────────────────────────────────────────
    // Client-specific report titles come from CLIENT_CONFIG if available.
    let pageTitle = MODULE_TITLES[id] || id;
    if (window.CLIENT_CONFIG) {
      const reportTitles = window.CLIENT_CONFIG.reportTitles || {};
      if (reportTitles[id]) pageTitle = reportTitles[id];
    }
    const topbarTitleEl = document.getElementById('topbar-title');
    if (topbarTitleEl) topbarTitleEl.textContent = pageTitle;

    // ── 3d. Load partial HTML ──────────────────────────────────────────────
    const container = document.getElementById('module-content');
    if (!container) return;

    container.innerHTML = '<div class="empty-state"><p>Loading…</p></div>';

    // intel-daily is a legacy key; map it to report-primary for backwards compat
    const partialId = id === 'intel-daily' ? 'report-primary' : id;
    const html = await _fetchPartial(partialId);

    if (html) {
      container.innerHTML = html;
    } else {
      container.innerHTML = `
        <div class="empty-state">
          <p>This module could not be loaded.</p>
          <p style="font-size:0.8rem;opacity:0.6">Expected file: partials/${partialId}.html</p>
        </div>`;
    }

    _currentModule = id;

    // ── 3e. Broadcast that a module is ready (intel-daily.js listens here) ─
    document.dispatchEvent(new CustomEvent('mm:module-loaded', { detail: { id, partialId } }));

    // ── 3f. Close sidebar on mobile after navigation ───────────────────────
    if (window.innerWidth < 900) {
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.remove('open');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4.  SIDEBAR TOGGLE  (hamburger button on mobile)
  // ─────────────────────────────────────────────────────────────────────────
  function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.toggle('open');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5.  TOAST NOTIFICATIONS
  // ─────────────────────────────────────────────────────────────────────────
  let _toastTimer = null;

  function toast(msg, durationMs = 3200) {
    const el = document.getElementById('id-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => el.classList.remove('show'), durationMs);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6.  CLIENT BRANDING  (reads from window.CLIENT_CONFIG — never from here)
  //
  //     window.CLIENT_CONFIG is set by js/client-config.js after login.
  //     That file is the ONLY place client-specific data should appear.
  //     This function reads it and pushes values into the DOM.
  // ─────────────────────────────────────────────────────────────────────────
  function applyClientBranding() {
    const cfg = window.CLIENT_CONFIG;

    // ── Client badge (hidden until signed in) ─────────────────────────────
    const badge = document.getElementById('client-badge');
    const nameEl = document.getElementById('client-name');
    const productEl = document.getElementById('client-product-line');

    if (cfg && badge) {
      if (nameEl) nameEl.textContent = cfg.displayName || '';
      if (productEl) productEl.textContent = cfg.productLineName || '';
      badge.removeAttribute('hidden');
    } else if (badge) {
      badge.setAttribute('hidden', '');
    }

    // ── Logo ──────────────────────────────────────────────────────────────
    const logoMark = document.getElementById('platform-logo-mark');
    if (cfg && cfg.logoUrl && logoMark) {
      // Replace the generic SVG with the client's actual logo.
      // The img + h1 wrapper keeps the same layout.
      logoMark.innerHTML = `
        <img src="${cfg.logoUrl}" alt="${cfg.displayName} logo"
             style="height:32px;width:auto;object-fit:contain;border-radius:4px">
        <div><h1 id="platform-name">Mind<span>+</span>Machine™</h1></div>`;
    }

    // ── Primary color accent ──────────────────────────────────────────────
    if (cfg && cfg.primaryColor) {
      document.documentElement.style.setProperty('--client-primary', cfg.primaryColor);
    }

    // ── Report nav labels ─────────────────────────────────────────────────
    //    Each client defines which report types they have and what they're
    //    called.  Example CLIENT_CONFIG shape:
    //      reportTitles: { 'report-primary': 'DNL Daily',
    //                      'report-secondary': 'Biweekly',
    //                      'report-tertiary': 'Quarterly' }
    //    Unused report nav items are hidden; the rest get the right label.
    const reportNavMap = {
      'report-primary':   'nav-report-primary',
      'report-secondary': 'nav-report-secondary',
      'report-tertiary':  'nav-report-tertiary',
    };

    Object.entries(reportNavMap).forEach(([moduleId, navId]) => {
      const navLink = document.getElementById(navId);
      if (!navLink) return;

      if (cfg && cfg.reportTitles && cfg.reportTitles[moduleId]) {
        const labelSpan = document.getElementById(`${navId}-label`);
        if (labelSpan) labelSpan.textContent = cfg.reportTitles[moduleId];
        navLink.removeAttribute('hidden');
      } else {
        navLink.setAttribute('hidden', '');
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 7.  SESSION SIGN-OUT
  // ─────────────────────────────────────────────────────────────────────────
  function signOut() {
    window.CLIENT_CONFIG = null;
    // Clear the in-memory partial cache so a different client's reports
    // cannot leak across sessions.
    Object.keys(_partialCache).forEach((k) => delete _partialCache[k]);
    applyClientBranding();
    toast('Signed out successfully.');
    showSection('dashboard');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 8.  MODULE VISIBILITY TOGGLE  (admin panel checkboxes)
  //     When an admin checks/unchecks a module toggle, the corresponding
  //     sidebar link is shown or hidden for that session.
  // ─────────────────────────────────────────────────────────────────────────
  function _handleModuleToggle(checkbox) {
    const moduleId = checkbox.getAttribute('data-module-toggle');
    document.querySelectorAll(`#sidebar-nav a[data-nav="${moduleId}"]`).forEach((a) => {
      a.style.display = checkbox.checked ? '' : 'none';
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 9.  ILLUSTRATIVE DASHBOARD CHAT  (no real backend; replace when ready)
  //     The responses are generic platform commentary — nothing client-
  //     specific so nothing leaks if someone inspects this file.
  // ─────────────────────────────────────────────────────────────────────────
  const _CHAT_RESPONSES = [
    'Based on triangulated signals across your KOL interviews and survey responses, the top unmet need is <strong>EMR/workflow integration</strong> — cited by 38% of respondents.',
    'Comparing the two leading solutions in remote monitoring: the market leader holds the installed-base advantage while the challenger is advancing via its biosensor line. The gap is in AI-assisted ambulatory interpretation.',
    'Signal synthesis — top 3 signals: (1) Workflow friction is the #1 adoption barrier, (2) AI accuracy is now table-stakes rather than a differentiator, (3) Reimbursement clarity in APAC markets is 12–18 months away.',
    'Opportunity scoring update: the highest-confidence opportunity scores 8.7 / 10 across all five scoring dimensions. Recommend a GO decision with a Q2 mobilisation timeline.',
  ];
  let _chatIdx = 0;

  function _sendChat() {
    const input = document.getElementById('chat-input');
    const msgs  = document.getElementById('chat-messages');
    if (!input || !msgs) return;
    const val = input.value.trim();
    if (!val) return;
    msgs.innerHTML += `
      <div class="chat-msg msg-user">
        <div class="msg-avatar">👤</div>
        <div class="msg-bubble">${val.replace(/</g, '&lt;')}</div>
      </div>`;
    input.value = '';
    msgs.scrollTop = msgs.scrollHeight;
    setTimeout(() => {
      msgs.innerHTML += `
        <div class="chat-msg msg-ai">
          <div class="msg-avatar">🧠</div>
          <div class="msg-bubble">${_CHAT_RESPONSES[_chatIdx++ % _CHAT_RESPONSES.length]}</div>
        </div>`;
      msgs.scrollTop = msgs.scrollHeight;
    }, 800);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 10. UNIFIED CLICK HANDLER
  //     ONE listener for the entire document. Every interactive pattern
  //     routes through here.  No inline onclick handlers; no duplicate
  //     listeners scattered across partial files.
  // ─────────────────────────────────────────────────────────────────────────
  document.addEventListener('click', (e) => {

    // ── 10a. Navigation links ──────────────────────────────────────────────
    const navEl = e.target.closest('[data-nav]');
    if (navEl) {
      e.preventDefault();
      showSection(navEl.getAttribute('data-nav'));
      return;
    }

    // ── 10b. Likert scale buttons (survey/KOL partials) ───────────────────
    const likertBtn = e.target.closest('[data-likert]');
    if (likertBtn) {
      likertBtn.closest('.likert-scale')
               .querySelectorAll('.likert-btn')
               .forEach((b) => b.classList.remove('selected'));
      likertBtn.classList.add('selected');
      return;
    }

    // ── 10c. Multiple-choice survey options ───────────────────────────────
    const surveyOpt = e.target.closest('[data-survey-opt]');
    if (surveyOpt) {
      surveyOpt.closest('.survey-question')
               .querySelectorAll('.survey-option')
               .forEach((o) => o.classList.remove('selected'));
      surveyOpt.classList.add('selected');
      return;
    }

    // ── 10d. Tab buttons (Intel Daily / report partials use custom tabs) ──
    const tabBtn = e.target.closest('[data-id-tab-btn]');
    if (tabBtn) {
      document.dispatchEvent(new CustomEvent('mm:id-show-tab', {
        detail: { tab: tabBtn.getAttribute('data-id-tab-btn') },
      }));
      return;
    }

    // ── 10e. Module visibility toggles (admin panel) ─────────────────────
    const modToggle = e.target.closest('[data-module-toggle]');
    if (modToggle) {
      _handleModuleToggle(modToggle);
      return;
    }

    // ── 10f. Sign-out button (any partial may include one) ────────────────
    if (e.target.closest('[data-action="sign-out"]')) {
      signOut();
      return;
    }

    // ── 10g. Dashboard chat send button ───────────────────────────────────
    if (e.target.id === 'chat-send') {
      _sendChat();
      return;
    }

    // ── 10h. Netlify deploy info button (admin partial) ───────────────────
    if (e.target.id === 'admin-deploy-netlify') {
      toast('See the README for step-by-step Netlify deployment instructions.');
      return;
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 11. KEYBOARD SHORTCUTS
  // ─────────────────────────────────────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    // Enter in chat input → send message
    if (e.target.id === 'chat-input' && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      _sendChat();
    }
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 12. HAMBURGER  (mobile sidebar open/close)
  // ─────────────────────────────────────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  if (hamburger) hamburger.addEventListener('click', toggleSidebar);

  // ─────────────────────────────────────────────────────────────────────────
  // 13. PUBLIC API
  //     Only expose what other files (intel-daily.js, client-config.js)
  //     genuinely need to call.
  // ─────────────────────────────────────────────────────────────────────────
  return {
    showSection,
    toggleSidebar,
    toast,
    applyClientBranding,
    signOut,
    getCurrentModule: () => _currentModule,
  };

})();

// ─────────────────────────────────────────────────────────────────────────────
// BOOT SEQUENCE
// 1. Apply branding from whatever CLIENT_CONFIG is already in memory
//    (if the user refreshed the page while signed in, client-config.js
//    will have restored the session before this script ran).
// 2. Navigate to the dashboard.
// ─────────────────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  if (typeof applyClientBranding === 'function') {
    applyClientBranding();             // defined in client-config.js
  } else {
    MM.applyClientBranding();          // fallback: use the copy inside MM
  }
  MM.showSection('dashboard');
});
