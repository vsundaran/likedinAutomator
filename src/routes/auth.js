const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();

let User = require("../models/User");
const Niche = require("../models/Niche");
const authenticateToken = require("../middleware/auth");
const upload = require("../middleware/upload");
const OTP = require("../models/OTP");
const { sendOTPEmail } = require("../services/emailService");
const crypto = require("crypto");
const SocialAccount = require("../models/SocialAccount");

// Validate required environment variables
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-for-dev-only";
if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  console.error(
    "FATAL: JWT_SECRET environment variable is required in production"
  );
  process.exit(1);
}

// Middleware to verify JWT token
// Input validation middleware
const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  next();
};

const validateSignupInput = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long" });
  }

  next();
};

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper to generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP route
router.post("/send-otp", async (req, res) => {
  try {
    const { email, type } = req.body;
    if (!email || !type) {
      return res.status(400).json({ message: "Email and type are required" });
    }

    if (type === "signup") {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({ message: "User already exists" });
      }
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OTP.findOneAndUpdate(
      { email: email.toLowerCase(), type },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    await sendOTPEmail(email, otp, type);

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// Signup endpoint (updated with OTP verification)
router.post("/signup", validateSignupInput, async (req, res) => {
  try {
    const { password, email, fullName, otp } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "OTP is required" });
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      otp,
      type: "signup",
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User already exists with this email" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName,
    });

    // Save new user
    const savedUser = await user.save();

    // Delete OTP after successful signup
    await OTP.deleteOne({ _id: otpRecord._id });

    // Generate JWT token
    const token = jwt.sign(
      { email: savedUser.email, id: savedUser._id },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(201).json({
      message: "Signup successful",
      token,
      user: {
        email: savedUser.email,
        id: savedUser._id,
        fullName: savedUser.fullName,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
// Login endpoint (updated with password verify, then return need OTP)
router.post("/login", validateLoginInput, async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // If OTP is provided, verify it
    if (otp) {
      const otpRecord = await OTP.findOne({
        email: normalizedEmail,
        otp,
        type: "login",
        expiresAt: { $gt: new Date() },
      });

      if (!otpRecord) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      await OTP.deleteOne({ _id: otpRecord._id });

      const token = jwt.sign({ email: user.email, id: user._id }, JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      });

      return res.json({
        message: "Login successful",
        token,
        user: { email: user.email, id: user._id, fullName: user.fullName },
      });
    }

    // If no OTP provided, send it
    const newOtp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.findOneAndUpdate(
      { email: normalizedEmail, type: "login" },
      { otp: newOtp, expiresAt },
      { upsert: true }
    );

    await sendOTPEmail(normalizedEmail, newOtp, "login");

    res.json({ message: "OTP sent to email", requiresOTP: true });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.findOneAndUpdate(
      { email: email.toLowerCase(), type: "reset_password" },
      { otp, expiresAt },
      { upsert: true }
    );

    await sendOTPEmail(email, otp, "reset_password");
    res.json({ message: "Reset OTP sent to email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      otp,
      type: "reset_password",
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();

    await OTP.deleteOne({ _id: otpRecord._id });

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Helper to get onboarding status
const getOnboardingStatus = async (userId) => {
  const user = await User.findById(userId);
  const socialCount = await SocialAccount.countDocuments({ userId });

  return {
    isNicheCompleted: !!user.nicheId,
    isSocialConnected: socialCount > 0,
    isBankDetailsCompleted: !!(user.bankDetails && user.bankDetails.accountNumber),
  };
};

// Get current user info
router.get("/me", authenticateToken, async (req, res) => {
  const onboardingStatus = await getOnboardingStatus(req.user.id);
  const user = await User.findById(req.user.id);
  res.json({
    user: {
      email: req.user.email,
      id: req.user.id,
      fullName: user.fullName,
    },
    onboardingStatus,
  });
});

// Verify token endpoint
router.get("/verify", authenticateToken, async (req, res) => {
  const onboardingStatus = await getOnboardingStatus(req.user.id);
  const user = await User.findById(req.user.id);
  res.json({
    message: "Token is valid",
    user: {
      email: req.user.email,
      id: req.user.id,
      fullName: user.fullName,
    },
    onboardingStatus,
  });
});

// Logout endpoint (client-side token removal)
router.post("/logout", authenticateToken, (req, res) => {
  res.json({ message: "Logout successful" });
});

// Update avatar
router.post("/avatar", authenticateToken, upload.single("avatar"), async (req, res) => {
  try {
    const { gender } = req.body;
    if (!gender) {
      return res.status(400).json({ message: "Gender is required" });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // Integrate HeyGen flow (Steps 1-6)
    const HeyGenService = require("../services/HeyGenService");
    const path = require("path");

    let heygenFields = {
      gender,
      avatarUrl,
      heygenAvatarId: null,
      heygenTalkingPhotoId: null,
      heygenVoiceId: null
    };

    try {
      const filePath = path.join(__dirname, "../../", avatarUrl);
      const user = await User.findById(req.user.id);
      const talkingPhotoName = `${user.fullName || "User"}_${Date.now()}`;

      // Step 1: Upload Asset
      console.log("HeyGen Step 1: Uploading Asset...");
      const imageKey = await HeyGenService.uploadAsset(filePath);

      // Step 2: Create Avatar Group
      console.log("HeyGen Step 2: Creating Avatar Group...");
      const groupId = await HeyGenService.createAvatarGroup(imageKey, talkingPhotoName);
      heygenFields.heygenAvatarId = groupId;

      // Step 3: Add Look to Group
      console.log("HeyGen Step 3: Adding Look to Group...");
      await HeyGenService.addLookToGroup(groupId, imageKey, talkingPhotoName);

      // Step 4: Poll for Training Status (Simple loop for demo/initial implementation)
      console.log("HeyGen Step 4: Waiting for Training/Moderation...");
      let isReady = false;
      let attempts = 0;
      while (!isReady && attempts < 10) {
        const status = await HeyGenService.getTrainingStatus(groupId);
        console.log(`Training status: ${status}`);
        if (status === 'completed' || status === 'active' || status === 'processed') {
          isReady = true;
        } else if (status === 'failed') {
          throw new Error("HeyGen look training failed");
        } else {
          attempts++;
          await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        }
      }

      // Step 5: Find Talking Photo ID
      console.log("HeyGen Step 5: Fetching Talking Photo ID...");
      const talkingPhotoId = await HeyGenService.findTalkingPhoto(talkingPhotoName);
      heygenFields.heygenTalkingPhotoId = talkingPhotoId;

      // Step 6: Pick Voice by Gender
      console.log("HeyGen Step 6: Mapping Voice by Gender...");
      const voiceId = await HeyGenService.pickVoiceByGender(gender);
      heygenFields.heygenVoiceId = voiceId;

    } catch (heygenError) {
      console.error("HeyGen integration failed:", heygenError);
      // We continue but some HeyGen features might not work for this user yet
    }

    await User.findByIdAndUpdate(req.user.id, heygenFields);

    res.json({
      message: "Avatar uploaded and HeyGen processed successfully",
      ...heygenFields
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update niche
router.post("/niche", authenticateToken, async (req, res) => {
  try {
    const { nicheId } = req.body;
    if (!nicheId) {
      return res.status(400).json({ message: "Niche ID required" });
    }

    const niche = await Niche.findById(nicheId);
    if (!niche) {
      return res.status(404).json({ message: "Niche not found" });
    }

    await User.findByIdAndUpdate(req.user.id, { nicheId });
    res.json({ message: "Niche updated successfully" });
  } catch (error) {
    console.error("Niche update error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update bank details
router.post("/bank-details", authenticateToken, async (req, res) => {
  try {
    const { accountNumber, ifscCode, accountHolderName, bankName } = req.body;
    if (!accountNumber || !ifscCode || !accountHolderName || !bankName) {
      return res.status(400).json({ message: "All bank details required" });
    }

    await User.findByIdAndUpdate(req.user.id, {
      bankDetails: { accountNumber, ifscCode, accountHolderName, bankName },
    });

    res.json({ message: "Bank details updated successfully" });
  } catch (error) {
    console.error("Bank details update error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get profile details
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("nicheId");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const onboardingStatus = await getOnboardingStatus(req.user.id);
    res.json({ user, onboardingStatus });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
