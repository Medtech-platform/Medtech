const { fetchFeedlyArticles } = require('./lib/feedly');

exports.handler = async () => {
  try {
    const result = await fetchFeedlyArticles();
    return { statusCode: 200, body: JSON.stringify(result) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
