const axios = require("axios");

class ImageService {
  constructor() {
    this.unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;
    this.pexelsApiKey = process.env.PEXELS_API_KEY;
  }

  async fetchImage(keyword) {
    const searchTerms = [
      "coding",
      "programming",
      "software",
      "software engineering",
      "software development",
      "software developer",
      "web development",
      "frontend development",
      "backend development",
      "full stack development",
      "computer science",
      "technology",
      "app development",
      "cloud computing",
      "data science",
      "machine learning",
      "artificial intelligence",
      "cybersecurity",
      "system design",
      "debugging",
      "hackathon",
      "open source",
      "developer workspace",
      "laptop coding",
      "code on screen",
      "team collaboration",
      "IT infrastructure",
      "software company",
      "startup office",
      "digital transformation",
    ];

    const searchTerm =
      searchTerms[Math.floor(Math.random() * searchTerms.length)];

    try {
      // Try Unsplash first
      if (this.unsplashAccessKey) {
        const image = await this.fetchFromUnsplash(searchTerm);
        if (image) return image;
      }

      // Fallback to Pexels
      if (this.pexelsApiKey) {
        const image = await this.fetchFromPexels(searchTerm);
        if (image) return image;
      }

      // Final fallback
      return this.getFallbackImage();
    } catch (error) {
      console.error("Image fetch failed:", error.message);
      return this.getFallbackImage();
    }
  }

  async fetchFromUnsplash(searchTerm) {
    try {
      const response = await axios.get(
        `https://api.unsplash.com/photos/random?query=${encodeURIComponent(
          searchTerm
        )}&client_id=${this.unsplashAccessKey}`
      );

      return {
        url: response.data.urls.regular,
        alt: response.data.alt_description || `Image related to ${searchTerm}`,
        source: "Unsplash",
      };
    } catch (error) {
      return null;
    }
  }

  async fetchFromPexels(searchTerm) {
    try {
      const response = await axios.get(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(
          searchTerm
        )}&per_page=1`,
        {
          headers: {
            Authorization: this.pexelsApiKey,
          },
        }
      );

      if (response.data.photos.length > 0) {
        const photo = response.data.photos[0];
        return {
          url: photo.src.medium,
          alt: photo.alt || `Image related to ${searchTerm}`,
          source: "Pexels",
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  getFallbackImage() {
    // Return a placeholder or generic programming image
    return {
      url: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-4.0.3&w=400",
      alt: "React development concept",
      source: "Fallback",
    };
  }
}

module.exports = new ImageService();
