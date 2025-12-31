const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const router = express.Router();

let User = require("../models/User");
const Niche = require("../models/Niche");
const authenticateToken = require("../middleware/auth");
const upload = require("../middleware/upload");

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

// Signup endpoint
router.post("/signup", validateSignupInput, async (req, res) => {
  try {
    const { password, email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json({ message: "User already exists with this email" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user
    const user = new User({
      email: email.toLowerCase(), // normalize email
      password: hashedPassword,
    });

    // Save new user
    const savedUser = await user.save();

    // Generate JWT token for immediate login after signup
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
      },
    });
  } catch (error) {
    console.error("Signup error:", error);

    if (error.code === 11000) {
      // MongoDB duplicate key error
      return res
        .status(409)
        .json({ message: "User already exists with this email" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
});
// Login endpoint
router.post("/login", validateLoginInput, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Normalize email to lowercase and trim whitespace
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        email: user.email,
        id: user._id,
      },
      JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        email: user.email,
        id: user._id,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Get current user info
router.get("/me", authenticateToken, (req, res) => {
  res.json({
    user: {
      email: req.user.email,
      id: req.user.id,
    },
  });
});

// Verify token endpoint
router.get("/verify", authenticateToken, (req, res) => {
  res.json({
    message: "Token is valid",
    user: {
      email: req.user.email,
      id: req.user.id,
    },
  });
});

// Logout endpoint (client-side token removal)
router.post("/logout", authenticateToken, (req, res) => {
  res.json({ message: "Logout successful" });
});

// Update avatar
router.post("/avatar", authenticateToken, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await User.findByIdAndUpdate(req.user.id, { avatarUrl });

    res.json({ message: "Avatar uploaded successfully", avatarUrl });
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
    res.json({ user });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
