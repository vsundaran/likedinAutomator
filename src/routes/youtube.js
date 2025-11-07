const authenticateToken = require("../middleware/auth");

const express = require("express");
const router = express.Router();

let Token = require("../models/Token");
const { getTokensFromCode } = require("../permissionProvider/youtube");

router.post(
  "/exchangeCodeForAccessToken",
  authenticateToken,
  async (req, res) => {
    const { code } = req.body;
    try {
      const accessTokenResp = await getTokensFromCode(code);
      const existingToken = await Token.findOne({ userId: req.user.id });

      if (existingToken) {
        existingToken.youtube.accessToken = accessTokenResp.access_token;
        existingToken.youtube.expiry = new Date(
          Date.now() + accessTokenResp.expiry_date * 1000
        );
        existingToken.youtube.refresh_token_expiry_date = new Date(
          Date.now() + accessTokenResp.refresh_token_expires_in * 1000
        );
        existingToken.youtube.refreshToken =
          accessTokenResp.refresh_token || null;
        existingToken.youtube.scope = accessTokenResp.scope;
        await existingToken.save();
      } else {
        const newToken = new Token({
          userId: req.user.id,
          youtube: {
            expiry: new Date(Date.now() + accessTokenResp.expiry_date * 1000),
            accessToken: accessTokenResp.access_token,
            refreshToken: accessTokenResp.refresh_token || null,
            refresh_token_expiry_date:
              accessTokenResp.refresh_token_expires_in || null,
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
