const { fetchAllFeeds } = require('./lib/rss');
const { fetchFeedlyArticles } = require('./lib/feedly');
const { scoreArticles } = require('./lib/scoring');
const { sendDigestEmail } = require('./lib/email');

// This is the fully automated version: Netlify itself wakes this
// function up on the schedule set in netlify.toml (default 9am daily).
// Nothing needs to be open in a browser for this to run.
exports.handler = async () => {
  try {
    const [rssArticles, feedlyResult] = await Promise.all([
      fetchAllFeeds(),
      fetchFeedlyArticles().catch((e) => ({ articles: [], skipped: true, reason: e.message })),
    ]);

    const seen = new Set();
    const combined = [...rssArticles, ...feedlyResult.articles].filter((a) => {
      if (seen.has(a.title)) return false;
      seen.add(a.title);
      return true;
    });

    const scored = await scoreArticles(combined);
    const high = scored.filter((a) => a.relevance === 'high');

    let emailResult = { sent: false };
    if (high.length) {
      emailResult = await sendDigestEmail(high);
    }

    console.log(`Intel Daily scheduled run: ${scored.length} articles, ${high.length} high relevance, email sent: ${emailResult.sent}`);
    return { statusCode: 200, body: JSON.stringify({ ok: true, total: scored.length, high: high.length, email: emailResult }) };
  } catch (err) {
    console.error('Scheduled digest failed:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
