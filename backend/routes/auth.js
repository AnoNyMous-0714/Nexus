/**
 * Authentication routes
 * Handles user registration and login
 */
const express = require("express")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const crypto = require("crypto")

const router = express.Router()

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "30d" })
}

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, age, gender, interestedIn, bio, profilePicture } = req.body

    // Validation
    if (!email || !password || !name || !age || !gender || !interestedIn) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" })
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      age,
      gender,
      interestedIn,
      bio,
      profilePicture,
    })

    await user.save()

    const token = generateToken(user._id)
    res.status(201).json({
      token,
      user: user.getPublicProfile(),
    })
  } catch (error) {
    console.error("Registration error:", error)
    res.status(500).json({ error: "Registration failed" })
  }
})

/**
 * POST /api/auth/login
 * Login user
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    // Update last active
    user.lastActive = new Date()
    await user.save()

    const token = generateToken(user._id)
    res.json({
      token,
      user: user.getPublicProfile(),
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ error: "Login failed" })
  }
})

/**
 * POST /api/auth/forgot-password
 * Request password reset link
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ error: "Email is required" })
    }

    const user = await User.findOne({ email })
    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: "If email exists, reset link will be sent" })
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex")

    user.resetPasswordToken = resetTokenHash
    user.resetPasswordExpires = new Date(Date.now() + 3600000) // 1 hour
    await user.save()

    // In production, send email with link: ${CLIENT_URL}/reset-password?token=${resetToken}&email=${email}
    // For now, return token for testing (remove in production)
    res.json({
      message: "Reset link sent to email",
      // For testing only - remove in production
      resetToken: resetToken,
      resetLink: `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&email=${email}`,
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    res.status(500).json({ error: "Failed to process request" })
  }
})

/**
 * POST /api/auth/reset-password
 * Reset password with valid token
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { email, token, newPassword } = req.body

    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: "Missing required fields" })
    }

    const resetTokenHash = crypto.createHash("sha256").update(token).digest("hex")

    const user = await User.findOne({
      email,
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: new Date() },
    })

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" })
    }

    // Update password
    user.password = newPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({ message: "Password reset successful" })
  } catch (error) {
    console.error("Reset password error:", error)
    res.status(500).json({ error: "Failed to reset password" })
  }
})

module.exports = router
