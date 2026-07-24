const { fetchAllFeeds } = require('./lib/rss');
const { fetchFeedlyArticles } = require('./lib/feedly');
const { scoreArticles } = require('./lib/scoring');
const { sendDigestEmail } = require('./lib/email');

// This single endpoint does the whole job in one request:
// 1. pull RSS articles
// 2. pull Feedly articles (if configured)
// 3. score everything with Gemini
// 4. optionally email the high-relevance ones
// The "Run now" button in the browser just calls this - no keys ever
// touch the browser, and no client-side proxy is needed for anything.
exports.handler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};

    const [rssArticles, feedlyResult] = await Promise.all([
      fetchAllFeeds(body.sources),
      fetchFeedlyArticles().catch((e) => ({ articles: [], skipped: true, reason: e.message })),
    ]);

    const seen = new Set();
    const combined = [...rssArticles, ...feedlyResult.articles].filter((a) => {
      if (seen.has(a.title)) return false;
      seen.add(a.title);
      return true;
    });

    const scored = await scoreArticles(combined, body.rules || {});
    const high = scored.filter((a) => a.relevance === 'high');
    const medium = scored.filter((a) => a.relevance === 'medium');

    let emailResult = { sent: false, reason: 'not requested' };
    if (body.sendEmail && high.length) {
      emailResult = await sendDigestEmail(high);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        articles: scored,
        stats: { total: scored.length, high: high.length, medium: medium.length },
        feedly: { used: !feedlyResult.skipped, reason: feedlyResult.reason || null },
        email: emailResult,
      }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
