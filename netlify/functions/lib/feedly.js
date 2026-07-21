const fetch = require('node-fetch');

// Feedly's Cloud API: https://developer.feedly.com
// This call happens on Netlify's server. Feedly never even sees a
// browser origin here, so the CORS question never comes up - CORS is
// purely a browser rule, and this isn't a browser making the request.
async function fetchFeedlyArticles() {
  const token = process.env.FEEDLY_ACCESS_TOKEN;
  const streamId = process.env.FEEDLY_STREAM_ID;

  if (!token || !streamId) {
    return { articles: [], skipped: true, reason: 'Feedly not configured' };
  }

  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  const url = `https://cloud.feedly.com/v3/streams/contents?streamId=${encodeURIComponent(
    streamId
  )}&count=50&newerThan=${cutoff}`;

  const res = await fetch(url, {
    headers: { Authorization: `OAuth ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Feedly API error (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const items = data.items || [];

  const articles = items.map((item) => ({
    title: item.title || '',
    summary: (item.summary && item.summary.content
      ? item.summary.content
      : (item.content && item.content.content) || ''
    ).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 400),
    source: (item.origin && item.origin.title) || 'Feedly',
    url: (item.alternate && item.alternate[0] && item.alternate[0].href) || item.originId || '',
    date: new Date(item.published || Date.now()).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    }),
    pubTs: item.published || Date.now(),
  }));

  return { articles, skipped: false };
}

module.exports = { fetchFeedlyArticles };
