/**
 * User routes
 * Handles user profile operations and discovery
 */
const express = require("express")
const User = require("../models/User")
const authMiddleware = require("../middleware/auth")

const router = express.Router()

/**
 * GET /api/users/me
 * Get current user profile
 */
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password")
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }
    res.json(user.getPublicProfile())
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" })
  }
})

/**
 * PUT /api/users/me
 * Update current user profile
 */
router.put("/me", authMiddleware, async (req, res) => {
  try {
    const { name, bio, age, profilePicture, preferences, location } = req.body

    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Update allowed fields
    if (name) user.name = name
    if (bio !== undefined) user.bio = bio
    if (age) user.age = age
    if (profilePicture) user.profilePicture = profilePicture
    if (preferences) user.preferences = { ...user.preferences, ...preferences }
    if (location) user.location = location

    user.updatedAt = new Date()
    await user.save()

    res.json(user.getPublicProfile())
  } catch (error) {
    console.error("Update error:", error)
    res.status(500).json({ error: "Failed to update profile" })
  }
})

/**
 * GET /api/users/discover
 * Get profiles to discover (with filtering)
 */
router.get("/discover", authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId)
    if (!currentUser) {
      return res.status(404).json({ error: "User not found" })
    }

    // Build filter query
    const filter = {
      _id: { $ne: req.userId }, // Exclude current user
      gender: currentUser.interestedIn === "both" ? { $in: ["male", "female", "other"] } : currentUser.interestedIn,
      $nor: [
        { _id: { $in: currentUser.likes } }, // Exclude already liked
        { _id: { $in: currentUser.dislikes } }, // Exclude already disliked
        { _id: { $in: currentUser.matches } }, // Exclude matches
        { _id: { $in: currentUser.blockedUsers } }, // Exclude blocked
      ],
    }

    // Apply age filter
    if (currentUser.preferences.ageMin || currentUser.preferences.ageMax) {
      filter.age = {}
      if (currentUser.preferences.ageMin) filter.age.$gte = currentUser.preferences.ageMin
      if (currentUser.preferences.ageMax) filter.age.$lte = currentUser.preferences.ageMax
    }

    const profiles = await User.find(filter).select("-password -blockedUsers").limit(20).lean()

    res.json(profiles)
  } catch (error) {
    console.error("Discovery error:", error)
    res.status(500).json({ error: "Failed to fetch profiles" })
  }
})

/**
 * GET /api/users/:id
 * Get specific user profile
 */
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -blockedUsers")
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }
    res.json(user.getPublicProfile())
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" })
  }
})

module.exports = router
