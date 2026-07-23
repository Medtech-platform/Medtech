const { fetchAllFeeds } = require('./lib/rss');
const { getStore } = require('@netlify/blobs');

// This function used to only work one way: someone had to pass in
// a list of RSS sources by hand. Now it can ALSO look up a client's
// saved list of sources automatically — using only a generic ID
// (like "client-a"), never a real company name.

exports.handler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const clientId = body.clientId;   // a generic ID, chosen in the Admin panel — never a real name
    let sources = body.sources;       // still works the old way if sources are passed directly

    // If no sources were given directly, look up this client's saved
    // RSS list from Netlify's private storage (not from GitHub).
    if ((!sources || sources.length === 0) && clientId) {
      const store = getStore('client-configs');
      sources = await store.get(`${clientId}/rss-sources`, { type: 'json' });
    }

    if (!sources || sources.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No RSS sources found for this client.' }),
      };
    }

    const articles = await fetchAllFeeds(sources);
    return { statusCode: 200, body: JSON.stringify({ articles }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
