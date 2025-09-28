const axios = require("axios");

class LinkedInService {
  constructor() {
    this.clientId = process.env.LINKEDIN_CLIENT_ID;
    this.clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
    this.redirectUri = process.env.LINKEDIN_REDIRECT_URI;
    this.accessToken = process.env.LINKEDIN_ACCESS_TOKEN;
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

      console.log(imageResponse, "imageResponse");
      // Register upload
      const registerResponse = await axios.post(
        "https://api.linkedin.com/v2/assets?action=registerUpload",
        {
          registerUploadRequest: {
            owner: "urn:li:person:I3KgH_-9K8", // e.g. "urn:li:person:xxxxxx"
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
            // Authorization: `Bearer ${this.accessToken}`,
            Authorization: `Bearer AQVvYRvWQ_Ogt5zpukxV8lOY8cluZcQV98Ql6p1N9E_JLPR4EsRz5cL_bXSG16H-byB9OxrdtQr8rsbBDXN6m4wNOEFtMwSOnmKVy3Z3hlLEDbwI2xz4ib_Oov4ahvZw6IFuLMPCVqXR4fhsn4Mb-RJJFbxqQGwWJ2LbHYzzpHr7tykIvyWKtj2JrxNo96epxcaqcyQ2jyB0C3xuYtYQPuk0sXOmtTbeQZvMKuWuBjP-ADHkJ5u4krcvv2hctF5-PkdVL8SZUK31959Q0JuDjf0nGWdURdjBuSahF-oc_dSuiGVmv8ktLJvUD7koXh6P2ySnWf4ax9XvwjBwsqo3wQGun020Mg`,
          },
        }
      );

      // console.log(registerResponse, "registerResponse");

      const uploadUrl =
        registerResponse.data.value.uploadMechanism[
          "com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest"
        ].uploadUrl;
      const assetUrn = registerResponse.data.value.asset;

      console.log(uploadUrl, "uploadUrl");

      // Upload image
      await axios.put(uploadUrl, imageResponse.data, {
        headers: {
          // Authorization: `Bearer ${this.accessToken}`,
          "Content-Type": "image/jpeg",
        },
      });

      // console.log(assetUrn, "assetUrn");
      return assetUrn;
    } catch (error) {
      throw new Error(`Image upload failed: ${error.message}`);
    }
  }

  async postToLinkedIn(postData) {
    // console.log(postData, "postData");
    try {
      let assetUrn = null;

      // Upload image if available
      if (postData.imageUrl) {
        assetUrn = await this.uploadImage(postData.imageUrl);
      }
      console.log(assetUrn, "assetUrn");

      // Create post
      const postPayload = {
        // author: `urn:li:person:${await this.getUserUrn()}`,
        author: `urn:li:person:I3KgH_-9K8`,
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

      console.log(JSON.stringify(postPayload), "postPayload");

      const response = await axios.post(
        "https://api.linkedin.com/v2/ugcPosts",
        postPayload,
        {
          headers: {
            // Authorization: `Bearer ${this.accessToken}`,
            Authorization:
              "Bearer AQVvYRvWQ_Ogt5zpukxV8lOY8cluZcQV98Ql6p1N9E_JLPR4EsRz5cL_bXSG16H-byB9OxrdtQr8rsbBDXN6m4wNOEFtMwSOnmKVy3Z3hlLEDbwI2xz4ib_Oov4ahvZw6IFuLMPCVqXR4fhsn4Mb-RJJFbxqQGwWJ2LbHYzzpHr7tykIvyWKtj2JrxNo96epxcaqcyQ2jyB0C3xuYtYQPuk0sXOmtTbeQZvMKuWuBjP-ADHkJ5u4krcvv2hctF5-PkdVL8SZUK31959Q0JuDjf0nGWdURdjBuSahF-oc_dSuiGVmv8ktLJvUD7koXh6P2ySnWf4ax9XvwjBwsqo3wQGun020Mg",
            "Content-Type": "application/json",
            // "X-Restli-Protocol-Version": "2.0.0",
          },
        }
      );

      return {
        postId: response.data.id,
        url: `https://www.linkedin.com/feed/update/${response.data.id}`,
      };
    } catch (error) {
      console.log(error, "error on post to linkedin fn");
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
    // For now, return a placeholder or store it in environment
    return process.env.LINKEDIN_USER_URN || "your_linkedin_user_urn";
  }
}

module.exports = new LinkedInService();
