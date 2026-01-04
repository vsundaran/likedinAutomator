const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

class HeyGenService {
    constructor() {
        this.apiKey = process.env.HEYGEN_API_KEY;
        this.uploadUrl = "https://upload.heygen.com/v1/asset";
        this.apiBaseUrl = "https://api.heygen.com/v2";
    }

    /**
     * Step 1: Upload Your Photo
     * @param {string|Buffer} fileData filePath Or Buffer
     * @param {string} filename Optional filename
     * @returns {Promise<string>} image_key
     */
    async uploadAsset(fileData, filename = "avatar.jpg") {
        try {
            if (!this.apiKey) {
                throw new Error("HEYGEN_API_KEY is not configured.");
            }

            console.log("HeyGen upload started for:", typeof fileData === 'string' ? fileData : 'Buffer');

            let buffer;
            let contentType = "image/jpeg"; // Default

            if (Buffer.isBuffer(fileData)) {
                buffer = fileData;
            } else {
                // Read from file path
                buffer = fs.readFileSync(fileData);
                // Simple content-type detection based on extension
                const ext = fileData.split('.').pop().toLowerCase();
                if (ext === 'png') contentType = 'image/png';
                else if (ext === 'webp') contentType = 'image/webp';
            }

            const response = await axios.post(this.uploadUrl, buffer, {
                headers: {
                    "x-api-key": this.apiKey,
                    "Content-Type": contentType,
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            });

            const imageKey = response.data?.data?.image_key;
            if (!imageKey) {
                console.error("HeyGen upload response:", JSON.stringify(response.data));
                throw new Error("Failed to get image_key from HeyGen upload response");
            }

            return imageKey;
        } catch (error) {
            console.error("HeyGen asset upload failed:", error.response?.data || error.message);
            throw new Error(`HeyGen asset upload failed: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Step 2: Create Avatar Group (Get the ID)
     * @param {string} imageKey 
     * @param {string} name 
     * @returns {Promise<string>} avatarId
     */
    async createAvatarGroup(imageKey, name = "My Avatar") {
        try {
            const response = await axios.post(
                `${this.apiBaseUrl}/photo_avatar/avatar_group/create`,
                {
                    name,
                    image_key: imageKey,
                },
                {
                    headers: {
                        "x-api-key": this.apiKey,
                        "Content-Type": "application/json",
                    },
                }
            );

            const avatarId = response.data?.data?.id;
            if (!avatarId) {
                throw new Error("Failed to get avatar ID from HeyGen create response");
            }

            return avatarId;
        } catch (error) {
            console.error("HeyGen avatar group creation failed:", error.response?.data || error.message);
            throw new Error(`HeyGen avatar group creation failed: ${error.message}`);
        }
    }

    /**
     * Step 3: Add Motion
     * @param {string} avatarId 
     * @param {string} prompt 
     * @param {string} motionType 
     * @returns {Promise<Object>}
     */
    async addMotion(avatarId, prompt = "A natural, breathing motion with a subtle smile", motionType = "consistent") {
        try {
            const response = await axios.post(
                `${this.apiBaseUrl}/photo_avatar/add_motion`,
                {
                    id: avatarId,
                    motion_type: motionType,
                    prompt,
                },
                {
                    headers: {
                        "x-api-key": this.apiKey,
                        "Content-Type": "application/json",
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error("HeyGen add motion failed:", error.response?.data || error.message);
            throw new Error(`HeyGen add motion failed: ${error.message}`);
        }
    }

    /**
     * Step 4: Get Avatar Details (Poll for video URL)
     * @param {string} avatarId 
     * @returns {Promise<Object>}
     */
    async getAvatarDetails(avatarId) {
        try {
            const response = await axios.get(`${this.apiBaseUrl}/photo_avatar/${avatarId}`, {
                headers: {
                    "x-api-key": this.apiKey,
                },
            });

            return response.data;
        } catch (error) {
            console.error("HeyGen avatar details fetch failed:", error.response?.data || error.message);
            throw new Error(`HeyGen avatar details fetch failed: ${error.message}`);
        }
    }

    /**
     * Step 5: Generate Full Video (Final Output)
     * @param {Object} params 
     * @returns {Promise<Object>}
     */
    async generateVideoV2({ photo_avatar_id, text, voice_id = "en-US-Standard-J", background_mode = "circular", test = false }) {
        try {
            const response = await axios.post(
                `${this.apiBaseUrl}/video/generate`,
                {
                    photo_avatar_id,
                    script_type: "text",
                    text,
                    voice_id,
                    background_mode,
                    test
                },
                {
                    headers: {
                        "x-api-key": this.apiKey,
                        "Content-Type": "application/json",
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.error("HeyGen video generation failed:", error.response?.data || error.message);
            throw new Error(`HeyGen video generation failed: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Step 6: Poll Video Status
     * @param {string} videoId 
     * @returns {Promise<Object>}
     */
    async getVideoStatusV2(videoId) {
        try {
            const response = await axios.get(`${this.apiBaseUrl}/video/${videoId}`, {
                headers: {
                    "x-api-key": this.apiKey,
                },
            });

            return response.data;
        } catch (error) {
            console.error("HeyGen video status fetch failed:", error.response?.data || error.message);
            throw new Error(`HeyGen video status fetch failed: ${error.response?.data?.message || error.message}`);
        }
    }

    /**
     * Legacy/Helper: Generate Video (Now essentially addMotion + polling logic if needed)
     */
    async generateVideo(avatarUrl, script, title) {
        // This was the old V1 version. The new way is:
        // 1. If we have a heygenAvatarId, use it for addMotion/generateVideoV2.
        // 2. If we only have a URL, we might need to re-upload or use a different endpoint.

        console.warn("generateVideo called - this should likely be handled by generateVideoV2 in V2");

        return this.generateVideoV2({
            photo_avatar_id: avatarUrl, // Assuming avatarUrl is the ID in this context if updated elsewhere
            text: script
        });
    }
}

module.exports = new HeyGenService();
