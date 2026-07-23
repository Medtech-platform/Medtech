/**
 * verify-admin.js
 * Netlify Function — POST /.netlify/functions/verify-admin
 *
 * Accepts: { clientId: string, password: string }
 * Returns: { success: boolean, token: string|null, clientId: string|null }
 *
 * How it works (plain English):
 * - Each client has its own password hash stored in Netlify environment variables.
 * - We hash the submitted password and compare it to the stored hash.
 * - If they match, we return a short-lived session token.
 * - Plain-text passwords NEVER appear in this file or anywhere in the code.
 * - The token is a signed timestamp — simple, no external library needed.
 *
 * Environment variables required in Netlify:
 * - THERMO_FISHER_PASSWORD_HASH  (hash of TFAdmin@123)
 * - RXBENEFITS_PASSWORD_HASH     (hash of RxAdmin@123)
 * - ADMIN_TOKEN_SECRET           (any long random string you choose)
 */

const crypto = require("crypto");

const CLIENT_HASH_ENV_MAP = {
  "thermo-fisher": "THERMO_FISHER_PASSWORD_HASH",
  "rxbenefits": "RXBENEFITS_PASSWORD_HASH",
};

function sha256(input) {
  return crypto.createHash("sha256").update(input, "utf8").digest("hex");
}

function generateToken(clientId) {
  const secret = process.env.ADMIN_TOKEN_SECRET || "changeme-set-in-netlify";
  const expiry = Date.now() + 8 * 60 * 60 * 1000; // 8 hours
  const payload = `${clientId}:${expiry}`;
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64");
}

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, error: "Method not allowed" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: "Invalid request body" }),
    };
  }

  const { clientId, password } = body;

  // Validate clientId exists
  const envKey = CLIENT_HASH_ENV_MAP[clientId];
  if (!envKey) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: "Unknown client" }),
    };
  }

  // Get the stored hash from environment
  const storedHash = process.env[envKey];
  if (!storedHash) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        error: `Password hash not configured. Add ${envKey} to Netlify environment variables.`,
      }),
    };
  }

  // Hash the submitted password and compare
  const submittedHash = sha256(password || "");
  const match = crypto.timingSafeEqual(
    Buffer.from(submittedHash, "hex"),
    Buffer.from(storedHash, "hex")
  );

  if (!match) {
    return {
      statusCode: 401,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: false, error: "Invalid credentials" }),
    };
  }

  // Credentials correct — issue session token
  const token = generateToken(clientId);
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ success: true, token, clientId }),
  };
};
