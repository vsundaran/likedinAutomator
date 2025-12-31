const axios = require("axios");

class HeyGenService {
    constructor() {
        this.apiKey = process.env.HEYGEN_API_KEY;
        this.baseUrl = "https://api.heygen.com/v1";
    }

    async generateVideo(avatarUrl, script, title) {
        try {
            if (!this.apiKey) {
                throw new Error("HEYGEN_API_KEY is not configured.");
            }

            const response = await axios.post(
                `${this.baseUrl}/video.generate`,
                {
                    video_settings: {
                        ratio: "16:9",
                    },
                    avatar: {
                        type: "talking_photo",
                        talking_photo_url: avatarUrl,
                    },
                    input_text: script,
                    voice: {
                        voice_id: "en-US-JennyNeural", // Default voice
                    },
                    title: title,
                },
                {
                    headers: {
                        "X-Api-Key": this.apiKey,
                        "Content-Type": "application/json",
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error("HeyGen video generation failed:", error.response?.data || error.message);
            throw new Error(`HeyGen video generation failed: ${error.message}`);
        }
    }

    async getVideoStatus(videoId) {
        try {
            const response = await axios.get(`${this.baseUrl}/video_status.get?video_id=${videoId}`, {
                headers: {
                    "X-Api-Key": this.apiKey,
                },
            });

            return response.data;
        } catch (error) {
            console.error("HeyGen video status check failed:", error.response?.data || error.message);
            throw new Error(`HeyGen video status check failed: ${error.message}`);
        }
    }
}

module.exports = new HeyGenService();
