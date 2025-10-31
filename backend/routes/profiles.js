/**
 * Profile routes
 * Handles profile-related operations
 */
const express = require("express")
const User = require("../models/User")
const authMiddleware = require("../middleware/auth")

const router = express.Router()

/**
 * GET /api/profiles/:userId
 * Get user profile (public view)
 */
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password -blockedUsers -likes -dislikes")

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json(user.getPublicProfile())
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" })
  }
})

/**
 * POST /api/profiles/block/:userId
 * Block a user
 */
router.post("/block/:userId", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    if (user.blockedUsers.includes(req.params.userId)) {
      return res.status(400).json({ error: "User already blocked" })
    }

    user.blockedUsers.push(req.params.userId)
    await user.save()

    res.json({ message: "User blocked" })
  } catch (error) {
    console.error("Block error:", error)
    res.status(500).json({ error: "Failed to block user" })
  }
})

module.exports = router
