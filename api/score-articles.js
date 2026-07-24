const { scoreArticles } = require('./lib/scoring');

exports.handler = async (event) => {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const scored = await scoreArticles(body.articles || [], body.rules || {});
    return { statusCode: 200, body: JSON.stringify({ articles: scored }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
