const { fetchAllFeeds } = require('./lib/rss');

exports.handler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const articles = await fetchAllFeeds(body.sources);
    return { statusCode: 200, body: JSON.stringify({ articles }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
