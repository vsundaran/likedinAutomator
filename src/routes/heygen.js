const express = require("express");
const router = express.Router();
const heygenController = require("../controllers/heygenController");
const authenticateToken = require("../middleware/auth");

router.post("/add-motion", authenticateToken, heygenController.addMotion);
router.get("/status", authenticateToken, heygenController.getAvatarStatus);
router.get("/video-status/:videoId", authenticateToken, heygenController.getVideoStatus);

module.exports = router;
