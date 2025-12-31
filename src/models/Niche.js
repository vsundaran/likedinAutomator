const mongoose = require("mongoose");

const NicheSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    description: {
        type: String,
    },
    topics: [{
        type: String,
    }],
}, { timestamps: true });

module.exports = mongoose.model("Niche", NicheSchema);
