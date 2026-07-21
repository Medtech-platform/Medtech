exports.handler = async () => {
  const status = {
    gemini: !!process.env.GEMINI_API_KEY,
    feedly: !!(process.env.FEEDLY_ACCESS_TOKEN && process.env.FEEDLY_STREAM_ID),
    email: !!(process.env.RESEND_API_KEY && process.env.DIGEST_TO_EMAIL && process.env.DIGEST_FROM_EMAIL),
  };
  return { statusCode: 200, body: JSON.stringify(status) };
};
