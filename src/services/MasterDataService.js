const Niche = require("../models/Niche");

class MasterDataService {
    async seedNiches() {
        const niches = [
            {
                name: "Fitness",
                description: "Health, workout, and wellness content.",
                topics: ["Workout routines", "Nutrition tips", "Mental health", "Supplements"],
            },
            {
                name: "Education",
                description: "Learning, tutorials, and academic content.",
                topics: ["Study tips", "Course reviews", "Career advice", "Technical tutorials"],
            },
            {
                name: "Tech",
                description: "Software, gadgets, and industry news.",
                topics: ["Programming", "AI/ML", "Cybersecurity", "Gadget reviews"],
            },
            {
                name: "Finance",
                description: "Personal finance, investing, and market news.",
                topics: ["Stock market", "Crypto", "Budgeting", "Real estate"],
            },
        ];

        for (const niche of niches) {
            await Niche.findOneAndUpdate(
                { name: niche.name },
                niche,
                { upsert: true, new: true }
            );
        }
        console.log("Niches seeded successfully.");
    }

    async getAllNiches() {
        return await Niche.find({});
    }

    async getNicheById(id) {
        return await Niche.findById(id);
    }
}

module.exports = new MasterDataService();
