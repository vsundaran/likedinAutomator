const axios = require("axios");

class LinkedInService {
  constructor() {
    this.clientId = process.env.LINKEDIN_CLIENT_ID;
    this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    this.redirectUri = process.env.LINKEDIN_REDIRECT_URI;
    this.accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
    this.userUrn = process.env.LINKEDIN_USER_URN;
  }

  async refreshAccessToken() {
    try {
      // Implementation for token refresh
      // This would require storing refresh tokens securely
      console.log("Token refresh functionality would be implemented here");
      return this.accessToken;
    } catch (error) {
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  async uploadImage(imageUrl) {
    try {
      // Download image
      const imageResponse = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });

      // Register upload
      const registerResponse = await axios.post(
        "https://api.linkedin.com/v2/assets?action=registerUpload",
        {
          registerUploadRequest: {
            owner: this.userUrn, // Dynamic from env
            recipes: ["urn:li:digitalmediaRecipe:feedshare-image"],
            serviceRelationships: [
              {
                relationshipType: "OWNER",
                identifier: "urn:li:userGeneratedContent",
              },
            ],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      const uploadUrl =
        registerResponse.data.value.uploadMechanism[
          "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
        ].uploadUrl;
      const assetUrn = registerResponse.data.value.asset;

      // Upload image
      await axios.put(uploadUrl, imageResponse.data, {
        headers: {
          "Content-Type": "image/jpeg",
        },
      });

      return assetUrn;
    } catch (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  async postToLinkedIn(postData) {
    try {
      let assetUrn = null;

      // Upload image if available
      if (postData.imageUrl) {
        assetUrn = await this.uploadImage(postData.imageUrl);
      }

      // Create post
      const postPayload = {
        author: this.userUrn, // Dynamic from env
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: postData.content,
            },
            shareMediaCategory: assetUrn ? "IMAGE" : "NONE",
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      };

      if (assetUrn) {
        postPayload.specificContent["com.linkedin.ugc.ShareContent"].media = [
          {
            status: "READY",
            description: {
              text: postData.imageAlt || "React development image",
            },
            media: assetUrn,
            title: { text: postData.imageAlt },
          },
        ];
      }

      const response = await axios.post(
        "https://api.linkedin.com/v2/ugcPosts",
        postPayload,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        postId: response.data.id,
        url: `https://www.linkedin.com/feed/update/${response.data.id}`,
      };
    } catch (error) {
      if (error.response?.status === 401) {
        // Token might be expired, try to refresh
        await this.refreshAccessToken();
        return this.postToLinkedIn(postData);
      }
      throw new Error(`LinkedIn post failed: ${error.message}`);
    }
  }

  async getUserUrn() {
    // This would fetch the user's URN from LinkedIn API
    // For now, return from environment
    return this.userUrn || "your_linkedin_user_urn";
  }
}

module.exports = new LinkedInService();
