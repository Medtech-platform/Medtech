// ═══════════════════════════════════════════════════════════════════════════
// MIND+MACHINE™ — INTEL DAILY (REPORT ENGINE)  |  intel-daily.js
// ─────────────────────────────────────────────────────────────────────────
// ARCHITECTURE NOTES (plain English):
//
//  • This file powers the "DNL Daily" report (and any equivalent daily/
//    weekly intelligence report for any client on the platform).
//
//  • WHAT LIVES HERE:
//      – UI rendering (article cards, tabs, email preview, progress steps)
//      – Calls to Netlify serverless functions that do the real work
//        (fetching RSS feeds, scoring with AI, sending email)
//      – Tab/filter navigation specific to this module
//
//  • WHAT DOES NOT LIVE HERE:
//      – API keys           → Netlify environment variables only
//      – Client names       → window.CLIENT_CONFIG (set by client-config.js)
//      – Search strings     → window.CLIENT_CONFIG.searchStrings
//      – Competitor lists   → window.CLIENT_CONFIG.competitors
//      – RSS feed URLs      → window.CLIENT_CONFIG.rssFeeds
//      – Scoring rules      → defaults come from CLIENT_CONFIG; user can
//                             override per-session via the Rules tab and
//                             those overrides are stored in localStorage
//                             under a key that includes the client key
//                             (so Client A's rules never bleed into Client B)
//      – Passwords / emails → never in frontend code; Netlify functions only
//
//  • MULTI-TENANT RULE ISOLATION:
//      localStorage keys are namespaced as  mm_intel_rules_<clientKey>
//      so switching clients gives a fresh rule set, not the previous
//      client's configuration.
//
//  • Every Netlify function call passes the active clientKey in the
//    request body so the server knows which client's config to load
//    from environment variables.
//
// ═══════════════════════════════════════════════════════════════════════════

const IntelDaily = (() => {

  // ─────────────────────────────────────────────────────────────────────────
  // 1.  MODULE STATE  (private — nothing leaks to global scope)
  // ─────────────────────────────────────────────────────────────────────────
  let _cssLoaded    = false;
  let _articles     = [];      // last batch returned by the server
  let _rules        = {};      // user-edited scoring rules for this session
  let _initialized  = false;   // guard against double-init on rapid nav clicks

  // ─────────────────────────────────────────────────────────────────────────
  // 2.  CLIENT CONFIG HELPERS
  //     All client-specific data is read from window.CLIENT_CONFIG.
  //     If no client is signed in (CLIENT_CONFIG is null / undefined),
  //     we show a "please sign in" state instead of real data.
  // ─────────────────────────────────────────────────────────────────────────
  function _cfg() {
    return window.CLIENT_CONFIG || null;
  }

  function _clientKey() {
    const cfg = _cfg();
    return cfg ? (cfg.clientKey || 'default') : 'default';
  }

  function _rulesStorageKey() {
    // Namespaced so Thermo Fisher rules never overwrite RxBenefits rules
    return `mm_intel_rules_${_clientKey()}`;
  }

  // Default scoring rules are generic — no client names.
  // CLIENT_CONFIG can supply client-specific overrides via
  // cfg.defaultScoringRules.high / .medium / .low
  function _defaultHighRule() {
    const cfg = _cfg();
    return (cfg && cfg.defaultScoringRules && cfg.defaultScoringRules.high) ||
      `Directly relevant to the client's industry and competitive landscape:
• Competitor product launches, M&A activity, or strategic announcements
• Regulatory approvals, enforcement actions, or policy changes
• Market sizing data, growth forecasts, or analyst reports
• Drug pricing, formulary changes, or reimbursement policy updates
• Clinical trial results for key therapeutic areas
• Funding rounds, IPOs, or leadership changes at competitors`;
  }

  function _defaultMedRule() {
    const cfg = _cfg();
    return (cfg && cfg.defaultScoringRules && cfg.defaultScoringRules.medium) ||
      `Adjacent but relevant:
• General healthcare system or insurance industry news
• Digital health and health IT trends
• Hospital network changes or health system transactions`;
  }

  function _defaultLowRule() {
    const cfg = _cfg();
    return (cfg && cfg.defaultScoringRules && cfg.defaultScoringRules.low) ||
      `Deprioritize:
• Sports, entertainment, or celebrity news
• General politics unrelated to healthcare or life sciences
• Consumer lifestyle content`;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3.  CSS LAZY LOADER
  //     intel-daily.css is only injected when this module is first opened,
  //     keeping the initial page load lighter.
  // ─────────────────────────────────────────────────────────────────────────
  function _ensureCss() {
    if (_cssLoaded) return;
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = 'css/intel-daily.css';
    document.head.appendChild(link);
    _cssLoaded = true;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4.  SCORING RULES  (load from localStorage, fall back to defaults)
  // ─────────────────────────────────────────────────────────────────────────
  function _loadRules() {
    try {
      const saved = localStorage.getItem(_rulesStorageKey());
      _rules = saved ? JSON.parse(saved) : {};
    } catch {
      _rules = {};
    }
    _setVal('id-highRule',   _rules.highRule   || _defaultHighRule());
    _setVal('id-medRule',    _rules.medRule    || _defaultMedRule());
    _setVal('id-lowRule',    _rules.lowRule    || _defaultLowRule());
    _setVal('id-orgContext', _rules.orgContext || '');
  }

  function _saveRules() {
    _rules = {
      highRule:   _getVal('id-highRule'),
      medRule:    _getVal('id-medRule'),
      lowRule:    _getVal('id-lowRule'),
      orgContext: _getVal('id-orgContext'),
    };
    try {
      localStorage.setItem(_rulesStorageKey(), JSON.stringify(_rules));
      MM.toast('✅ Rules saved');
    } catch {
      MM.toast('⚠️ Could not save rules — storage may be full');
    }
  }

  function _resetRules() {
    try { localStorage.removeItem(_rulesStorageKey()); } catch { /* ignore */ }
    _rules = {};
    _setVal('id-highRule',   _defaultHighRule());
    _setVal('id-medRule',    _defaultMedRule());
    _setVal('id-lowRule',    _defaultLowRule());
    _setVal('id-orgContext', '');
    MM.toast('↩️ Rules reset to defaults');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5.  DOM HELPERS
  // ─────────────────────────────────────────────────────────────────────────
  function _getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
  }

  function _setVal(id, v) {
    const el = document.getElementById(id);
    if (el) el.value = v;
  }

  function _setText(id, v) {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  }

  function _show(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = '';
  }

  function _hide(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  }

  function _escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6.  RSS SOURCE LIST RENDERER
  //     Source names come from CLIENT_CONFIG.rssFeedLabels (an array of
  //     human-readable names).  Feedly board is configured server-side.
  // ─────────────────────────────────────────────────────────────────────────
  function _renderSourceList() {
    const el = document.getElementById('id-rssList');
    if (!el) return;

    const cfg = _cfg();
    const labels = (cfg && cfg.rssFeedLabels) || [
      'Industry news feeds (configured per client)',
    ];

    el.innerHTML =
      labels.map((n) => `<div class="id-rss-item">📰 ${_escapeHtml(n)}</div>`).join('') +
      `<div class="id-rss-item id-rss-feedly">
         🔗 Feedly board — configured securely on the server, not visible here
       </div>`;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 7.  STATUS CHECK  (pings the Netlify status function)
  // ─────────────────────────────────────────────────────────────────────────
  async function _checkStatus() {
    const box = document.getElementById('id-statusResult');
    if (box) { box.style.display = 'block'; box.textContent = '⏳ Checking…'; }

    try {
      const res = await fetch('/.netlify/functions/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientKey: _clientKey() }),
      });
      const s = await res.json();

      if (box) {
        box.innerHTML =
          `${s.gemini ? '✅' : '❌'} AI scoring &nbsp; ` +
          `${s.feedly ? '✅' : '❌'} Feedly &nbsp; ` +
          `${s.email  ? '✅' : '❌'} Email sending`;
      }
      _updateDashboardBadge(s);
      return s;
    } catch {
      if (box) box.textContent = '❌ Could not reach server functions. Are you on Netlify?';
      return null;
    }
  }

  function _updateDashboardBadge(s) {
    const bar = document.getElementById('dash-intel-bar');
    const lbl = document.getElementById('dash-intel-status');
    if (!bar || !lbl) return;
    const full  = s && s.gemini && s.feedly && s.email;
    const ready = s && s.gemini;
    bar.style.width  = full ? '100%' : (ready ? '65%' : '10%');
    lbl.textContent  = full ? 'Fully automated' : (ready ? 'Partially configured' : 'Not configured');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 8.  PROGRESS STEP HELPERS
  // ─────────────────────────────────────────────────────────────────────────
  function _stepIcon(i, state, customIcon) {
    const el = document.getElementById('id-pi' + i);
    if (!el) return;
    el.className = 'id-picon ' + state;
    if (state === 'run')  el.innerHTML = '<span class="id-spin">⟳</span>';
    else if (state === 'done') el.innerHTML = customIcon || '✓';
    else if (state === 'err')  el.innerHTML = '✕';
    else                       el.innerHTML = '⏱';
  }

  function _stepDetail(i, msg) {
    const el = document.getElementById('id-pd' + i);
    if (el) el.textContent = msg;
  }

  function _setStatusText(t) {
    _setText('id-statusText', t);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 9.  MAIN RUN — calls the Netlify digest function
  //     The function receives:
  //       clientKey   — which client's config to load on the server
  //       rules       — this session's scoring rules
  //       sendEmail   — false for a manual preview run; true for scheduled
  //
  //     The server is responsible for reading the right API keys, RSS feeds,
  //     search strings, and competitor lists from environment variables
  //     keyed by clientKey.  None of that data is sent from the browser.
  // ─────────────────────────────────────────────────────────────────────────
  async function _runNow() {
    const runBtn = document.getElementById('id-runBtn');

    _hide('id-emptyRun');
    _hide('id-artsSec');
    _hide('id-statsRow');
    _show('id-progWrap');
    if (runBtn) runBtn.disabled = true;
    _setStatusText('Running…');

    const STEPS = [
      { name: 'Fetch RSS + Feedly',    detail: 'Pulling articles from configured sources…' },
      { name: 'AI relevance scoring',  detail: 'Scoring each article against your rules…' },
      { name: 'Compile digest',        detail: 'Assembling the report…' },
    ];

    const ps = document.getElementById('id-progSteps');
    if (ps) {
      ps.innerHTML = STEPS.map((s, i) => `
        <div class="id-pstep">
          <div class="id-picon wait" id="id-pi${i}">⏱</div>
          <div class="id-pbody">
            <div class="id-pname">${_escapeHtml(s.name)}</div>
            <div class="id-pdet" id="id-pd${i}">${_escapeHtml(s.detail)}</div>
          </div>
        </div>`).join('');
    }

    try {
      // Step 1: fetch
      _stepIcon(0, 'run');
      _stepDetail(0, 'Contacting the secure server endpoint…');

      const res = await fetch('/.netlify/functions/run-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientKey: _clientKey(),
          rules:     _rules,
          sendEmail: false,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Step 1 done
      _stepIcon(0, 'done');
      _stepDetail(0, `${data.stats.total} articles fetched from ${data.feedly.used ? 'Feedly + RSS' : 'RSS feeds'}`);

      // Step 2 done
      _stepIcon(1, 'done');
      const low = data.stats.total - data.stats.high - data.stats.medium;
      _stepDetail(1, `${data.stats.high} high · ${data.stats.medium} medium · ${low} low relevance`);

      // Step 3 done
      _stepIcon(2, 'done');
      _stepDetail(2, 'Digest ready for review');

      // Populate stats bar
      _setText('id-stTotal',  data.stats.total);
      _setText('id-stHigh',   data.stats.high);
      _setText('id-stMed',    data.stats.medium);
      _setText('id-stEmail',  data.feedly.used ? 'Feedly + RSS' : 'RSS only');
      _show('id-statsRow');

      // Render results
      _articles = data.articles;
      _renderArticles('all');
      _buildEmailPreview();

      _setStatusText(`✅ Done · ${data.stats.high} high-relevance articles`);
      MM.toast(`✅ Done! ${data.stats.high} high-relevance articles found`);

    } catch (err) {
      _stepIcon(0, 'err');
      _stepIcon(1, 'err');
      _stepDetail(1, err.message || 'An error occurred — check the Setup Status tab');
      _setStatusText('Error — see progress above');
      MM.toast('❌ ' + (err.message || 'Run failed'));
    }

    if (runBtn) runBtn.disabled = false;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 10. ARTICLE GRID RENDERER
  // ─────────────────────────────────────────────────────────────────────────
  function _renderArticles(filter) {
    _show('id-artsSec');
// ─────────────────────────────────────────────────────────────────────────
  // 10b. JSON REPORT LOADER (GitHub Actions static output)
  // ─────────────────────────────────────────────────────────────────────────
  async function _loadJsonReport() {
    const container = document.getElementById('daily-report-container');
    if (!container) return;

    try {
      const response = await fetch('/daily_report.json');
      if (!response.ok) throw new Error('JSON report file not found');

      const articles = await response.json();

      if (!articles || !articles.length) {
        container.innerHTML = '<div class="empty-state"><p>No daily reports available for today yet.</p></div>';
        return;
      }

      container.innerHTML = articles.map((art) => `
        <div class="intel-card" style="border: 1px solid #e0e0e0; padding: 16px; margin-bottom: 16px; border-radius: 8px; background: #fff;">
          <h3 style="margin-top: 0; font-size: 1.1rem; color: #1f4e78;">
            <a href="${_escapeHtml(art.link)}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: inherit;">
              ${_escapeHtml(art.title)}
            </a>
          </h3>
          <p style="margin: 8px 0; color: #333; line-height: 1.5;">${_escapeHtml(art.summary)}</p>
          <small style="color: #666; font-weight: 500;">${_escapeHtml(art.source_line)}</small>
        </div>
      `).join('');
    } catch (err) {
      console.warn('Could not load daily_report.json:', err);
    }
  }
    const high = _articles.filter((a) => a.relevance === 'high').length;
    _setText('id-artCountLbl', `${_articles.length} articles · ${high} high relevance`);

    // Update filter pill active state
    document.querySelectorAll('.id-fpill').forEach((b) =>
      b.classList.toggle('on', b.getAttribute('data-id-filter') === filter));

    const list = filter === 'all'
      ? _articles
      : _articles.filter((a) => a.relevance === filter);

    const grid = document.getElementById('id-artsGrid');
    if (!grid) return;

    if (!list.length) {
      grid.innerHTML = '<div class="empty-state"><p>No articles in this category.</p></div>';
      return;
    }

    grid.innerHTML = list.map((art) => `
      <div class="id-art-card ${art.relevance === 'high' ? 'high-rel' : ''}">
        <div class="id-art-body">
          <div class="id-art-title">
            ${art.url
              ? `<a href="${_escapeHtml(art.url)}" target="_blank" rel="noopener noreferrer">${_escapeHtml(art.title)}</a>`
              : _escapeHtml(art.title)}
          </div>
          <div class="id-art-summary">${_escapeHtml(art.aiSummary || art.summary || '')}</div>
          <div class="id-art-footer">
            <span class="id-badge id-b-${_escapeHtml(art.relevance)}">${_escapeHtml((art.relevance || 'low').toUpperCase())}</span>
            <span class="id-badge id-b-cat">${_escapeHtml(art.source || '')}</span>
            <span class="id-art-date">${_escapeHtml(art.date || '')}</span>
            ${art.url ? `<a class="id-art-link" href="${_escapeHtml(art.url)}" target="_blank" rel="noopener noreferrer">↗ Read</a>` : ''}
          </div>
        </div>
      </div>`).join('');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 11. EMAIL PREVIEW BUILDER
  //     Shows a plain-text preview of what the scheduled email will contain.
  //     The actual email is sent by the Netlify function — no SMTP config
  //     or recipient addresses exist in this file.
  // ─────────────────────────────────────────────────────────────────────────
  function _buildEmailPreview() {
    const cfg  = _cfg();
    const high = _articles.filter((a) => a.relevance === 'high');

    // Badge on the Email tab showing article count
    const badge = document.getElementById('id-emailBadge');
    if (badge) {
      badge.textContent    = high.length;
      badge.style.display  = high.length ? 'inline' : 'none';
    }

    if (!high.length) {
      _show('id-emailEmpty');
      _hide('id-emailContent');
      return;
    }

    _hide('id-emailEmpty');
    _show('id-emailContent');

    const today       = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const reportName  = (cfg && cfg.reportTitles && cfg.reportTitles['report-primary']) || 'Daily Intelligence Report';

    let body = `${reportName} — ${today}\n`;
    body += '═'.repeat(60) + '\n\n';

    high.forEach((art, i) => {
      body += `${i + 1}. ${art.title}\n`;
      if (art.aiSummary || art.summary) body += `   ${art.aiSummary || art.summary}\n`;
      body += `   Source: ${art.source}  ·  ${art.date}\n`;
      if (art.url) body += `   ${art.url}\n`;
      body += '\n';
    });

    body += '─'.repeat(60) + '\n';
    body += `This digest is generated automatically by Mind+Machine™.\n`;

    _setText('id-eBody', body);
    _setText('id-emailArtCount',
      `${high.length} high-relevance article${high.length !== 1 ? 's' : ''} — this is what the scheduled run emails automatically`);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 12. TAB NAVIGATION  (within the Intel Daily module)
  // ─────────────────────────────────────────────────────────────────────────
  function showTab(name) {
    document.querySelectorAll('.id-panel').forEach((p) => p.classList.remove('active'));
    document.querySelectorAll('.id-tab').forEach((t)   => t.classList.remove('active'));

    const panel = document.getElementById('id-panel-' + name);
    const tab   = document.querySelector(`.id-tab[data-id-tab="${name}"]`);
    if (panel) panel.classList.add('active');
    if (tab)   tab.classList.add('active');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 13. HEADER DATE — formatted, never hard-coded
  // ─────────────────────────────────────────────────────────────────────────
  function _renderHeaderDate() {
    const cfg        = _cfg();
    const reportName = (cfg && cfg.reportTitles && cfg.reportTitles['report-primary']) || 'Daily Report';
    const dateStr    = new Date().toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });

    _setText('id-hdrDate',       dateStr);
    _setText('id-hdrReportName', reportName);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 14. COPY TO CLIPBOARD
  // ─────────────────────────────────────────────────────────────────────────
  function _copyEmailBody() {
    const body = document.getElementById('id-eBody');
    if (!body) return;
    navigator.clipboard.writeText(body.textContent)
      .then(()  => MM.toast('📋 Copied to clipboard'))
      .catch(()  => MM.toast('⚠️ Copy failed — try selecting the text manually'));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 15. INIT — called once per module load
  // ─────────────────────────────────────────────────────────────────────────
  function init() {
    // Guard: if the module reloads while already in progress, skip re-binding
    if (_initialized) {
      // Still refresh dynamic content (date, client name) on re-entry
      _renderHeaderDate();
      _renderSourceList();
      _loadJsonReport();
      return;
    }

    _ensureCss();
    _renderHeaderDate();
    _loadRules();
    _renderSourceList();
    _checkStatus();

    // ── Button bindings (all within the partial; no global listeners needed)
    const bind = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('click', fn);
    };

    bind('id-runBtn',        _runNow);
    bind('id-saveRulesBtn',  _saveRules);
    bind('id-resetRulesBtn', _resetRules);
    bind('id-checkStatusBtn',_checkStatus);
    bind('id-copyBtn',       _copyEmailBody);

    // ── Tab clicks
    document.querySelectorAll('.id-tab').forEach((t) => {
      t.addEventListener('click', () => showTab(t.getAttribute('data-id-tab')));
    });

    // ── Filter pills (all / high / medium / low)
    document.querySelectorAll('[data-id-filter]').forEach((b) => {
      b.addEventListener('click', () => _renderArticles(b.getAttribute('data-id-filter')));
    });

    _initialized = true;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 16. PUBLIC API
  // ─────────────────────────────────────────────────────────────────────────
  return { init, showTab };

})();

// ─────────────────────────────────────────────────────────────────────────────
// MODULE EVENT LISTENERS
// These are wired to the events that app.js dispatches when it loads a module.
// 'intel-daily' is the legacy route key; 'report-primary' is the new generic
// key.  Both trigger IntelDaily.init() so the transition is seamless.
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('mm:module-loaded', (e) => {
  const { id } = e.detail;

  // Intel Daily / primary report module
  if (id === 'intel-daily' || id === 'report-primary') {
    IntelDaily.init();
    return;
  }

  // Dashboard: ping status endpoint and update the at-a-glance badge
  // without loading the full Intel Daily module
  if (id === 'dashboard') {
    const clientKey = window.CLIENT_CONFIG ? (window.CLIENT_CONFIG.clientKey || 'default') : 'default';
    fetch('/.netlify/functions/status', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ clientKey }),
    })
      .then((r) => r.json())
      .then((s) => {
        const bar = document.getElementById('dash-intel-bar');
        const lbl = document.getElementById('dash-intel-status');
        if (!bar || !lbl) return;
        const full  = s.gemini && s.feedly && s.email;
        const ready = s.gemini;
        bar.style.width = full ? '100%' : (ready ? '65%' : '10%');
        lbl.textContent = full ? 'Fully automated' : (ready ? 'Partially configured' : 'Not configured');
      })
      .catch(() => { /* dashboard badge is non-critical; fail silently */ });
  }
});

// Tab-show event dispatched by app.js when the user clicks a data-id-tab-btn
document.addEventListener('mm:id-show-tab', (e) => IntelDaily.showTab(e.detail.tab));
