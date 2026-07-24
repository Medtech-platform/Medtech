module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  const config = process.env.CLIENT_CONFIG || '{}';
  res.status(200).send(`window.CLIENT_CONFIG = ${config};`);
};
