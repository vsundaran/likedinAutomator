const express = require("express");
const router = express.Router();
const MasterDataService = require("../services/MasterDataService");

// Get all niches
router.get("/", async (req, res) => {
    try {
        const niches = await MasterDataService.getAllNiches();
        res.json(niches);
    } catch (error) {
        console.error("Fetch niches error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
