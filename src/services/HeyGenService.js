const axios = require("axios");
const fs = require("fs");

class HeyGenService {
    constructor() {
        this.apiKey = process.env.HEYGEN_API_KEY;
        this.uploadUrl = "https://upload.heygen.com/v1/asset";
        this.apiBaseUrl = "https://api.heygen.com/v2";
    }

    /**
     * Step 1: Upload Asset (V1)
     * @param {string|Buffer} fileData filePath Or Buffer
     * @returns {Promise<string>} image_key
     */
    async uploadAsset(fileData) {
        try {
            if (!this.apiKey) {
                throw new Error("HEYGEN_API_KEY is not configured.");
            }

            let buffer;
            let contentType = "image/jpeg";

            if (Buffer.isBuffer(fileData)) {
                buffer = fileData;
            } else {
                buffer = fs.readFileSync(fileData);
                const ext = fileData.split('.').pop().toLowerCase();
                if (ext === 'png') contentType = 'image/png';
                else if (ext === 'jpeg' || ext === 'jpg') contentType = 'image/jpeg';
            }

            const response = await axios.post(this.uploadUrl, buffer, {
                headers: {
                    "x-api-key": this.apiKey,
                    "Content-Type": contentType,
                    "accept": "application/json"
                }
            });

            const imageKey = response.data?.data?.image_key;
            if (!imageKey) {
                throw new Error("Failed to get image_key from HeyGen upload");
            }

            return imageKey;
        } catch (error) {
            console.error("HeyGen asset upload failed:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Step 2: Create Photo Avatar Group (V2)
     * @param {string} imageKey 
     * @param {string} name 
     * @returns {Promise<string>} group_id
     */
    async createAvatarGroup(imageKey, name = "My Avatar Group") {
        try {
            const response = await axios.post(
                `${this.apiBaseUrl}/photo_avatar/avatar_group/create`,
                { name, image_key: imageKey },
                {
                    headers: {
                        "x-api-key": this.apiKey,
                        "content-type": "application/json",
                        "accept": "application/json"
                    }
                }
            );

            return response.data?.data?.id;
        } catch (error) {
            console.error("HeyGen create avatar group failed:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Step 3: Add Look to Avatar Group (V2)
     * @param {string} groupId 
     * @param {string} imageKey 
     * @param {string} name 
     */
    async addLookToGroup(groupId, imageKey, name = "My Look") {
        try {
            const response = await axios.post(
                `${this.apiBaseUrl}/photo_avatar/avatar_group/add`,
                { group_id: groupId, image_keys: [imageKey], name },
                {
                    headers: {
                        "x-api-key": this.apiKey,
                        "content-type": "application/json",
                        "accept": "application/json"
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error("HeyGen add look failed:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Step 4: Check Look Generation Status (V2)
     * @param {string} groupId 
     */
    async getTrainingStatus(groupId) {
        try {
            const response = await axios.get(
                `${this.apiBaseUrl}/photo_avatar/train/status/${groupId}`,
                {
                    headers: {
                        "x-api-key": this.apiKey,
                        "accept": "application/json"
                    }
                }
            );
            return response.data?.data?.status;
        } catch (error) {
            console.error("HeyGen fetch training status failed:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Step 5: List Avatars to find talking photo ID (V2)
     * @param {string} talkingPhotoName 
     */
    async findTalkingPhoto(talkingPhotoName) {
        try {
            const response = await axios.get(
                `${this.apiBaseUrl}/avatars`,
                {
                    headers: {
                        "x-api-key": this.apiKey,
                        "accept": "application/json"
                    }
                }
            );

            const talkingPhotos = response.data?.data?.talking_photos || [];
            // Try to find by name
            return talkingPhotos.find(tp => tp.talking_photo_name === talkingPhotoName)?.talking_photo_id;
        } catch (error) {
            console.error("HeyGen list avatars failed:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Step 6: List Voices and pick one by gender (V2)
     * @param {string} gender 'male' or 'female'
     */
    async pickVoiceByGender(gender) {
        try {
            const response = await axios.get(
                `${this.apiBaseUrl}/voices`,
                {
                    headers: {
                        "x-api-key": this.apiKey,
                        "accept": "application/json"
                    }
                }
            );

            const voices = response.data?.data?.voices || [];
            // Filter by gender and pick the first one (or a stable one)
            const filteredVoices = voices.filter(v => v.gender.toLowerCase() === gender.toLowerCase() && v.language === 'English');
            return filteredVoices[0]?.voice_id || voices[0]?.voice_id;
        } catch (error) {
            console.error("HeyGen list voices failed:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Step 7: Generate Video (V2)
     */
    async generateVideoV2({ talking_photo_id, voice_id, text, title }) {
        try {
            const payload = {
                caption: true,
                video_inputs: [{
                    character: {
                        type: "talking_photo",
                        scale: 1,
                        avatar_style: "normal",
                        talking_style: "stable",
                        talking_photo_id: talking_photo_id,
                        expression: "happy"
                    },
                    voice: {
                        type: "text",
                        speed: "1",
                        pitch: "0",
                        voice_id: voice_id,
                        input_text: text
                    },
                    background: {
                        type: "color",
                        value: "#FFFFFF"
                    },
                    text: {
                        type: "text",
                        text: " ",
                        line_height: 0.1
                    }
                }],
                dimension: { width: 1280, height: 720 },
                title: title
            };

            const response = await axios.post(
                `${this.apiBaseUrl}/video/generate`,
                payload,
                {
                    headers: {
                        "x-api-key": this.apiKey,
                        "content-type": "application/json",
                        "accept": "application/json"
                    }
                }
            );

            return response.data?.data?.video_id;
        } catch (error) {
            console.error("HeyGen video generation failed:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Step 8: Get Video Status (V1)
     */
    async getVideoStatus(videoId) {
        try {
            const response = await axios.get(
                `https://api.heygen.com/v1/video_status.get?video_id=${videoId}`,
                {
                    headers: {
                        "x-api-key": this.apiKey,
                        "accept": "application/json"
                    }
                }
            );
            return response.data?.data;
        } catch (error) {
            console.error("HeyGen fetch video status failed:", error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = new HeyGenService();
