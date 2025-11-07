const { google } = require("googleapis");

class YouTubeAuthHelper {
  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.YOUTUBE_CLIENT_ID,
      process.env.YOUTUBE_CLIENT_SECRET,
      process.env.YOUTUBE_REDIRECT_URI
    );

    this.SCOPES = [
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/youtube.force-ssl",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ];

    // Bind methods to maintain 'this' context
    this.generateAuthUrl = this.generateAuthUrl.bind(this);
    this.getTokensFromCode = this.getTokensFromCode.bind(this);
    this.setCredentials = this.setCredentials.bind(this);
    this.refreshAccessToken = this.refreshAccessToken.bind(this);
    this.getChannelInfo = this.getChannelInfo.bind(this);
    this.getUserInfo = this.getUserInfo.bind(this);
  }

  // Generate authorization URL
  generateAuthUrl(state) {
    return this.oauth2Client.generateAuthUrl({
      access_type: "offline", // Important: Get refresh token
      scope: this.SCOPES,
      state: state, // Pass user ID or session ID
      prompt: "consent", // Force consent screen to get refresh token
    });
  }

  // Exchange authorization code for tokens
  async getTokensFromCode(code) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  // Set credentials for API calls
  setCredentials(tokens) {
    this.oauth2Client.setCredentials(tokens);
    return this.oauth2Client;
  }

  // Refresh access token
  async refreshAccessToken(refreshToken) {
    this.oauth2Client.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await this.oauth2Client.refreshAccessToken();
    return credentials;
  }

  // Get user's YouTube channel info
  async getChannelInfo(auth) {
    const youtube = google.youtube({ version: "v3", auth });

    const response = await youtube.channels.list({
      part: "snippet,contentDetails,statistics",
      mine: true,
    });

    return response.data.items[0];
  }

  // Get OAuth2 user info
  async getUserInfo(auth) {
    const oauth2 = google.oauth2({ version: "v2", auth });
    const userInfo = await oauth2.userinfo.get();
    return userInfo.data;
  }
}

module.exports = new YouTubeAuthHelper();
