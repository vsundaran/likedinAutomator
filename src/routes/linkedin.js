const { exchangeCodeForToken } = require("../permissionProvider/linkedin");
const authenticateToken = require("../middleware/auth");

const express = require("express");
const router = express.Router();

let Token = require("../models/Token");

router.post(
  "/exchangeCodeForAccessToken",
  authenticateToken,
  async (req, res) => {
    const { code } = req.body;
    try {
      const accessTokenResp = await exchangeCodeForToken(code);
      const existingToken = await Token.findOne({ userId: req.user.id });
      if (existingToken) {
        existingToken.linkedin.accessToken = accessTokenResp.access_token;
        existingToken.linkedin.expiry = new Date(Date.now() + accessTokenResp.expires_in * 1000);
        existingToken.linkedin.refreshToken = accessTokenResp.refresh_token || null;
        existingToken.linkedin.scope = accessTokenResp.scope;
        await existingToken.save();
      } else {
        const newToken = new Token({
          userId: req.user.id,
          linkedin: {
            expiry: new Date(Date.now() + accessTokenResp.expires_in * 1000),
            accessToken: accessTokenResp.access_token,
            refreshToken: accessTokenResp.refresh_token || null,
            scope: accessTokenResp.scope,
          },
        });
        await newToken.save();
      }
      res.json({ access_token: accessTokenResp.access_token });
    } catch (error) {
      console.error("Failed to exchange code for access token:", error);
      res
        .status(500)
        .json({ message: "Failed to exchange code for access token", error });
    }
  }
);

module.exports = router;

