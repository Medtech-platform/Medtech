// ═══════════════════════════════════════════════════════════════════════════
// MIND+MACHINE™  |  netlify/functions/auth.js
// ─────────────────────────────────────────────────────────────────────────
// This is a Netlify "serverless function". Think of it as a tiny private
// server that runs in the cloud. The browser calls it, it does the secret
// work, and sends back only what the browser is allowed to see.
//
// WHAT THIS FILE DOES:
//   1. Receives a clientKey + password from the login screen
//   2. Looks up the correct password from Netlify environment variables
//      (those are set by YOU in the Netlify dashboard — never in code)
//   3. If the password matches, returns the full client configuration
//      (display name, logo, colors, report titles, etc.)
//   4. If the password is wrong, returns an error — no config is sent
//
// WHAT IS NEVER IN THIS FILE:
//   • No actual passwords          → Netlify environment variables only
//   • No API keys                  → Netlify environment variables only
//   • No client email addresses    → Netlify environment variables only
//   • No competitor lists          → Netlify environment variables only
//
// HOW PASSWORDS WORK (plain English):
//   You go to your Netlify dashboard → Site Settings → Environment Variables
//   and add variables like:
//     PASSWORD_CLIENT_TF  =  TFAdmin@123
//     PASSWORD_CLIENT_RX  =  RxAdmin@123
//   This file reads those variables at runtime. They never appear in GitHub.
//
// ═══════════════════════════════════════════════════════════════════════════

exports.handler = async function (event) {

  // ── Only accept POST requests ────────────────────────────────────────────
  if (event.httpMethod !== 'POST') {
    return _respond(405, { error: 'Method not allowed' });
  }

  // ── Parse the request body ───────────────────────────────────────────────
  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return _respond(400, { error: 'Invalid request format' });
  }

  const { clientKey, password } = body;

  // ── Validate that both fields were sent ──────────────────────────────────
  if (!clientKey || typeof clientKey !== 'string') {
    return _respond(400, { error: 'A client must be selected' });
  }
  if (!password || typeof password !== 'string') {
    return _respond(400, { error: 'Password is required' });
  }

  // ── Look up the client registry ──────────────────────────────────────────
  // CLIENT_REGISTRY maps every clientKey to:
  //   passwordEnvVar  — the name of the Netlify env variable that holds
  //                     the password for this client (never the password itself)
  //   config          — everything the browser is allowed to know AFTER login
  //                     (display name, logo, colors, report titles, etc.)
  //
  // TO ADD A NEW CLIENT: add one entry here.  Nothing else changes.
  // The actual password goes in Netlify environment variables, not here.

  const CLIENT_REGISTRY = {

    // ── Client 1 ────────────────────────────────────────────────────────────
    'client-tf': {
      passwordEnvVar: 'PASSWORD_CLIENT_TF',   // Set this in Netlify dashboard
      config: {
        clientKey:       'client-tf',
        displayName:     process.env.DISPLAY_NAME_CLIENT_TF   || 'Client 1',
        productLineName: process.env.PRODUCT_LINE_CLIENT_TF   || 'Opportunity Assessment Suite',
        logoUrl:         process.env.LOGO_URL_CLIENT_TF       || '',
        primaryColor:    process.env.PRIMARY_COLOR_CLIENT_TF  || '#3B6EF8',
        rssFeedLabels:   _parseJsonEnv('RSS_LABELS_CLIENT_TF', [
          'Managed Healthcare Executive',
          'Becker\'s Payer Issues',
          'BioPharma Dive',
          'Drug Channels',
          'Fierce Healthcare',
          'Health Affairs',
          'CMS Newsroom',
          'FTC News',
          'Reuters Health',
          'KFF',
        ]),
        reportTitles: {
          'report-primary':   process.env.REPORT_PRIMARY_CLIENT_TF   || 'DNL Daily',
          'report-secondary': process.env.REPORT_SECONDARY_CLIENT_TF || 'Biweekly',
          'report-tertiary':  process.env.REPORT_TERTIARY_CLIENT_TF  || 'Quarterly',
        },
        defaultScoringRules: {
          high: process.env.SCORING_HIGH_CLIENT_TF || '',
          medium: process.env.SCORING_MED_CLIENT_TF || '',
          low: process.env.SCORING_LOW_CLIENT_TF || '',
        },
      },
    },

    // ── Client 2 ────────────────────────────────────────────────────────────
    'client-rx': {
      passwordEnvVar: 'PASSWORD_CLIENT_RX',   // Set this in Netlify dashboard
      config: {
        clientKey:       'client-rx',
        displayName:     process.env.DISPLAY_NAME_CLIENT_RX   || 'Client 2',
        productLineName: process.env.PRODUCT_LINE_CLIENT_RX   || 'Intelligence Suite',
        logoUrl:         process.env.LOGO_URL_CLIENT_RX       || '',
        primaryColor:    process.env.PRIMARY_COLOR_CLIENT_RX  || '#00C2A8',
        rssFeedLabels:   _parseJsonEnv('RSS_LABELS_CLIENT_RX', [
          'Drug Channels',
          'BenefitsPro',
          'Managed Healthcare Executive',
          'Fierce Healthcare',
          '46Brooklyn',
          'PharmaVoice',
          'STAT News',
          'Reuters Health',
          'CMS Newsroom',
          'KFF',
        ]),
        reportTitles: {
          'report-primary':   process.env.REPORT_PRIMARY_CLIENT_RX   || 'DNL Daily',
          'report-secondary': process.env.REPORT_SECONDARY_CLIENT_RX || 'Weekly',
          'report-tertiary':  process.env.REPORT_TERTIARY_CLIENT_RX  || 'Quarterly',
          'report-quaternary': process.env.REPORT_QUATERNARY_CLIENT_RX || 'Annual Report',
        },
        defaultScoringRules: {
          high: process.env.SCORING_HIGH_CLIENT_RX || '',
          medium: process.env.SCORING_MED_CLIENT_RX || '',
          low: process.env.SCORING_LOW_CLIENT_RX || '',
        },
      },
    },

  };

  // ── Check the client key exists ──────────────────────────────────────────
  const clientEntry = CLIENT_REGISTRY[clientKey];
  if (!clientEntry) {
    // Return the same generic error as a wrong password.
    // Never confirm whether a clientKey is valid to an unauthenticated caller.
    return _respond(401, { error: 'Incorrect password. Please try again.' });
  }

  // ── Read the expected password from the environment ──────────────────────
  const expectedPassword = process.env[clientEntry.passwordEnvVar];

  if (!expectedPassword) {
    // The environment variable has not been configured yet in Netlify.
    // Tell the operator clearly without leaking anything to the end user.
    console.error(
      `[auth] Environment variable "${clientEntry.passwordEnvVar}" is not set. ` +
      `Go to Netlify → Site Settings → Environment Variables and add it.`
    );
    return _respond(503, {
      error: 'This client account is not yet configured. Contact your administrator.',
    });
  }

  // ── Compare passwords (constant-time to prevent timing attacks) ──────────
  if (!_safeCompare(password, expectedPassword)) {
    return _respond(401, { error: 'Incorrect password. Please try again.' });
  }

  // ── Password correct — return the client config ──────────────────────────
  // The browser now knows who is logged in and can apply branding.
  // We do NOT return any API keys, passwords, email addresses, or
  // search strings here — those are used only by other server functions.
  return _respond(200, {
    clientConfig: clientEntry.config,
  });

};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: constant-time string comparison
// Prevents "timing attacks" where someone could guess a password character
// by character by measuring how long the comparison takes.
// ─────────────────────────────────────────────────────────────────────────────
function _safeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) {
    // Still do a dummy comparison so the time taken is consistent
    let dummy = 0;
    for (let i = 0; i < a.length; i++) dummy |= a.charCodeAt(i) ^ 0;
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: parse a JSON array from an env variable, fall back to a default
// Used for things like RSS feed label lists that can be configured per client
// ─────────────────────────────────────────────────────────────────────────────
function _parseJsonEnv(varName, fallback) {
  try {
    const val = process.env[varName];
    if (!val) return fallback;
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: build a consistent HTTP response
// ─────────────────────────────────────────────────────────────────────────────
function _respond(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      // Prevent the browser from caching auth responses
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
    body: JSON.stringify(body),
  };
}
