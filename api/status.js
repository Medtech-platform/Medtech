// api/status.js
module.exports = async (req, res) => {
  try {
    // If you had environment variable checks or logic, keep them here:
    const clientConfig = process.env.CLIENT_CONFIG ? JSON.parse(process.env.CLIENT_CONFIG) : null;

    res.status(200).json({
      status: "ok",
      configured: !!clientConfig,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
