const { Resend } = require('resend');

function buildEmailBody(articles) {
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const name = process.env.DIGEST_TO_NAME || 'Team';
  let body = `Hi ${name},\n\nPlease find today's intelligence digest from ${today} below.\n\n`;
  articles.forEach((art, i) => {
    body += `${i + 1}. ${art.title}\n${art.aiSummary || art.summary || ''}\nSource: ${art.source} - ${art.date}\n${art.url || ''}\n\n`;
  });
  body += `---\nSent automatically by Mind+Machine (TM) Intel Daily\n`;
  return body;
}

async function sendDigestEmail(articles) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.DIGEST_TO_EMAIL;
  const from = process.env.DIGEST_FROM_EMAIL;
  const cc = process.env.DIGEST_CC_EMAILS ? process.env.DIGEST_CC_EMAILS.split(',').map((s) => s.trim()) : undefined;

  if (!key || !to || !from) {
    return { sent: false, reason: 'Email not fully configured (RESEND_API_KEY / DIGEST_TO_EMAIL / DIGEST_FROM_EMAIL)' };
  }

  const resend = new Resend(key);
  const body = buildEmailBody(articles);
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  await resend.emails.send({
    from,
    to,
    cc,
    subject: `Intel Daily - ${today}`,
    text: body,
  });

  return { sent: true };
}

module.exports = { buildEmailBody, sendDigestEmail };
