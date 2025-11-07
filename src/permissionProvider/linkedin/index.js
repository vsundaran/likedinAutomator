const axios = require("axios");
const qs = require("querystring");

const TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const ME_URL = "https://api.linkedin.com/v2/me";

async function exchangeCodeForToken(code) {
  const params = {
    grant_type: "authorization_code",
    code,
    redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
    client_id: process.env.LINKEDIN_CLIENT_ID,
    client_secret: process.env.LINKEDIN_CLIENT_SECRET,
  };

  const resp = await axios.post(TOKEN_URL, qs.stringify(params), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  return resp.data;
}

module.exports = {
  exchangeCodeForToken,
};
