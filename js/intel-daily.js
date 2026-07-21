// ═══════════════════════════════════════════════════════════
// INTEL DAILY — FRONTEND
// No API keys live here. Every call goes to a Netlify function
// (see /netlify/functions) which holds the real secrets.
// ═══════════════════════════════════════════════════════════

const IntelDaily = (() => {
  let cssLoaded = false;
  let idArticles = [];
  let idRules = {};
  const RSS_SOURCE_NAMES = ['MedCity News', 'STAT News', 'Healthcare IT News', 'Healthcare Dive', 'MedTech Dive'];

  const DEFAULT_HIGH = `Directly relevant to medical device or healthcare business intelligence:
• FDA approvals, clearances, or enforcement actions
• Clinical trial results for medical devices or therapeutics
• Competitor product launches, M&A, or strategic moves
• Market sizing data, growth forecasts, or analyst reports
• Reimbursement or regulatory policy changes
• Funding rounds or IPOs in medtech/biotech`;
  const DEFAULT_MED = `Adjacent but useful:
• General healthcare system news
• Digital health and health IT trends
• Hospital network changes or health system deals`;
  const DEFAULT_LOW = `Deprioritize:
• Sports, entertainment, celebrity news
• General politics unrelated to healthcare`;

  function ensureCss() {
    if (cssLoaded) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'css/intel-daily.css';
    document.head.appendChild(link);
    cssLoaded = true;
  }

  function loadRules() {
    try {
      idRules = JSON.parse(localStorage.getItem('mm_intel_rules') || '{}');
    } catch (e) {
      idRules = {};
    }
    setVal('id-highRule', idRules.highRule || DEFAULT_HIGH);
    setVal('id-medRule', idRules.medRule || DEFAULT_MED);
    setVal('id-lowRule', idRules.lowRule || DEFAULT_LOW);
    setVal('id-orgContext', idRules.orgContext || '');
  }

  function saveRules() {
    idRules = {
      highRule: getVal('id-highRule'),
      medRule: getVal('id-medRule'),
      lowRule: getVal('id-lowRule'),
      orgContext: getVal('id-orgContext'),
    };
    localStorage.setItem('mm_intel_rules', JSON.stringify(idRules));
    MM.toast('✅ Rules saved');
  }

  function getVal(id) { const el = document.getElementById(id); return el ? el.value : ''; }
  function setVal(id, v) { const el = document.getElementById(id); if (el) el.value = v; }

  function renderSourceList() {
    const el = document.getElementById('id-rssList');
    if (!el) return;
    el.innerHTML = RSS_SOURCE_NAMES.map((n) => `<div>📰 ${n}</div>`).join('') +
      `<div style="margin-top:8px;color:rgba(11,15,26,.45)">🔗 Feedly board (configured on server)</div>`;
  }

  async function checkStatus() {
    const box = document.getElementById('id-statusResult');
    if (box) { box.style.display = 'block'; box.textContent = '⏳ Checking...'; }
    try {
      const res = await fetch('/.netlify/functions/status');
      const s = await res.json();
      if (box) {
        box.innerHTML =
          (s.gemini ? '✅' : '❌') + ' Gemini &nbsp; ' +
          (s.feedly ? '✅' : '❌') + ' Feedly &nbsp; ' +
          (s.email ? '✅' : '❌') + ' Email sending';
      }
      updateDashboardBadge(s);
      return s;
    } catch (e) {
      if (box) box.textContent = '❌ Could not reach server functions (are you running this on Netlify?)';
      return null;
    }
  }

  function updateDashboardBadge(s) {
    const bar = document.getElementById('dash-intel-bar');
    const lbl = document.getElementById('dash-intel-status');
    if (!bar || !lbl) return;
    const ready = s && s.gemini;
    const full = s && s.gemini && s.feedly && s.email;
    bar.style.width = full ? '100%' : (ready ? '65%' : '10%');
    lbl.textContent = full ? 'Fully automated' : (ready ? 'Partially configured' : 'Not configured');
  }

  function setStatusText(t) {
    const el = document.getElementById('id-statusText');
    if (el) el.textContent = t;
  }

  function stepIcon(i, state, icon) {
    const el = document.getElementById('id-pi' + i);
    if (!el) return;
    el.className = 'id-picon ' + state;
    el.innerHTML = state === 'run' ? '<span class="id-spin">⟳</span>' : (icon || (state === 'done' ? '✓' : '✕'));
  }
  function stepDetail(i, msg) {
    const el = document.getElementById('id-pd' + i);
    if (el) el.textContent = msg;
  }

  async function runNow() {
    const runBtn = document.getElementById('id-runBtn');
    document.getElementById('id-emptyRun').style.display = 'none';
    document.getElementById('id-artsSec').style.display = 'none';
    document.getElementById('id-statsRow').style.display = 'none';
    document.getElementById('id-progWrap').style.display = 'block';
    if (runBtn) runBtn.disabled = true;
    setStatusText('Running...');

    const steps = [
      { name: 'Fetch RSS + Feedly', detail: 'Calling the secure server endpoint...' },
      { name: 'AI relevance scoring', detail: 'Gemini is scoring each article...' },
      { name: 'Compile digest', detail: 'Assembling results...' },
    ];
    const ps = document.getElementById('id-progSteps');
    ps.innerHTML = steps.map((s, i) =>
      `<div class="id-pstep"><div class="id-picon wait" id="id-pi${i}">⏱</div>
        <div class="id-pbody"><div class="id-pname">${s.name}</div><div class="id-pdet" id="id-pd${i}">${s.detail}</div></div></div>`
    ).join('');

    try {
      stepIcon(0, 'run');
      const res = await fetch('/.netlify/functions/run-digest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: idRules, sendEmail: false }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      stepIcon(0, 'done');
      stepIcon(1, 'done');
      stepDetail(1, `${data.stats.high} high · ${data.stats.medium} medium · ${data.stats.total - data.stats.high - data.stats.medium} low`);
      stepIcon(2, 'done');
      stepDetail(2, 'Digest ready');

      idArticles = data.articles;
      document.getElementById('id-stTotal').textContent = data.stats.total;
      document.getElementById('id-stHigh').textContent = data.stats.high;
      document.getElementById('id-stMed').textContent = data.stats.medium;
      document.getElementById('id-stEmail').textContent = data.feedly.used ? 'Feedly + RSS' : 'RSS only';
      document.getElementById('id-statsRow').style.display = 'grid';

      renderArticles('all');
      buildEmailPreview();
      setStatusText(`✅ Done · ${data.stats.high} high-relevance`);
      MM.toast(`✅ Done! ${data.stats.high} high-relevance articles found`);
    } catch (e) {
      stepIcon(1, 'err');
      stepDetail(1, e.message || 'Error - check Setup Status tab');
      MM.toast('❌ ' + (e.message || 'Error'));
      setStatusText('Error');
    }
    if (runBtn) runBtn.disabled = false;
  }

  function renderArticles(filter) {
    document.getElementById('id-artsSec').style.display = 'block';
    const high = idArticles.filter((a) => a.relevance === 'high').length;
    document.getElementById('id-artCountLbl').textContent = `${idArticles.length} articles · ${high} high relevance`;
    document.querySelectorAll('.id-fpill').forEach((b) => b.classList.toggle('on', b.getAttribute('data-id-filter') === filter));

    const list = idArticles.filter((a) => filter === 'all' || a.relevance === filter);
    const grid = document.getElementById('id-artsGrid');
    grid.innerHTML = list.map((art) => `
      <div class="id-art-card ${art.relevance === 'high' ? 'high-rel' : ''}">
        <div class="id-art-body">
          <div class="id-art-title">${art.url ? `<a href="${art.url}" target="_blank" rel="noopener">${escapeHtml(art.title)}</a>` : escapeHtml(art.title)}</div>
          <div class="id-art-summary">${escapeHtml(art.aiSummary || art.summary || '')}</div>
          <div class="id-art-footer">
            <span class="id-badge id-b-${art.relevance}">${(art.relevance || 'low').toUpperCase()}</span>
            <span class="id-badge id-b-cat">${escapeHtml(art.source)}</span>
            <span class="id-art-date">${escapeHtml(art.date)}</span>
            ${art.url ? `<a class="id-art-link" href="${art.url}" target="_blank" rel="noopener">↗ Read</a>` : ''}
          </div>
        </div>
      </div>`).join('') || '<div class="empty-state"><p>No articles in this category.</p></div>';
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function buildEmailPreview() {
    const high = idArticles.filter((a) => a.relevance === 'high');
    const badge = document.getElementById('id-emailBadge');
    if (badge) { badge.textContent = high.length; badge.style.display = high.length ? 'inline' : 'none'; }
    document.getElementById('id-emailEmpty').style.display = high.length ? 'none' : 'block';
    document.getElementById('id-emailContent').style.display = high.length ? 'block' : 'none';
    if (!high.length) return;

    const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    let body = `Today's intelligence digest — ${today}\n\n`;
    high.forEach((art, i) => {
      body += `${i + 1}. ${art.title}\n${art.aiSummary || art.summary || ''}\nSource: ${art.source} · ${art.date}\n${art.url || ''}\n\n`;
    });
    document.getElementById('id-eBody').textContent = body;
    document.getElementById('id-emailArtCount').textContent = `${high.length} high-relevance articles (this is what the scheduled run emails automatically)`;
  }

  function showTab(name) {
    document.querySelectorAll('.id-panel').forEach((p) => p.classList.remove('active'));
    document.querySelectorAll('.id-tab').forEach((t) => t.classList.remove('active'));
    const panel = document.getElementById('id-panel-' + name);
    const tab = document.querySelector(`.id-tab[data-id-tab="${name}"]`);
    if (panel) panel.classList.add('active');
    if (tab) tab.classList.add('active');
  }

  function init() {
    ensureCss();
    document.getElementById('id-hdrDate').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    loadRules();
    renderSourceList();
    checkStatus();

    document.getElementById('id-runBtn').addEventListener('click', runNow);
    document.getElementById('id-saveRulesBtn').addEventListener('click', saveRules);
    document.getElementById('id-checkStatusBtn').addEventListener('click', checkStatus);
    document.getElementById('id-copyBtn')?.addEventListener('click', () => {
      navigator.clipboard.writeText(document.getElementById('id-eBody').textContent)
        .then(() => MM.toast('📋 Copied to clipboard'));
    });

    document.querySelectorAll('.id-tab').forEach((t) => {
      t.addEventListener('click', () => showTab(t.getAttribute('data-id-tab')));
    });
    document.querySelectorAll('[data-id-filter]').forEach((b) => {
      b.addEventListener('click', () => renderArticles(b.getAttribute('data-id-filter')));
    });
  }

  return { init, showTab };
})();

document.addEventListener('mm:module-loaded', (e) => {
  if (e.detail.id === 'intel-daily') IntelDaily.init();
  if (e.detail.id === 'dashboard') {
    fetch('/.netlify/functions/status').then((r) => r.json()).then((s) => {
      const bar = document.getElementById('dash-intel-bar');
      const lbl = document.getElementById('dash-intel-status');
      if (bar && lbl) {
        const full = s.gemini && s.feedly && s.email;
        bar.style.width = full ? '100%' : (s.gemini ? '65%' : '10%');
        lbl.textContent = full ? 'Fully automated' : (s.gemini ? 'Partially configured' : 'Not configured');
      }
    }).catch(() => {});
  }
});

document.addEventListener('mm:id-show-tab', (e) => IntelDaily.showTab(e.detail.tab));
