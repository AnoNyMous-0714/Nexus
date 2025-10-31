/**
 * Matching routes
 * Handles likes, dislikes, super likes, and match creation
 */
const express = require("express")
const User = require("../models/User")
const Match = require("../models/Match")
const authMiddleware = require("../middleware/auth")

const router = express.Router()

/**
 * POST /api/matches/like/:targetId
 * Like a user profile
 */
router.post("/like/:targetId", authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId)
    const targetUser = await User.findById(req.params.targetId)

    if (!currentUser || !targetUser) {
      return res.status(404).json({ error: "User not found" })
    }

    // Check if already liked
    if (currentUser.likes.includes(req.params.targetId)) {
      return res.status(400).json({ error: "Already liked this user" })
    }

    // Add to likes
    currentUser.likes.push(req.params.targetId)
    await currentUser.save()

    // Check if target user also likes current user (mutual match)
    if (targetUser.likes.includes(req.userId)) {
      // Create match
      const match = new Match({
        user1: req.userId,
        user2: req.params.targetId,
      })
      await match.save()

      // Add to matches
      currentUser.matches.push(req.params.targetId)
      targetUser.matches.push(req.userId)
      await currentUser.save()
      await targetUser.save()

      return res.json({ matched: true, message: "It's a match!" })
    }

    res.json({ matched: false, message: "Like sent" })
  } catch (error) {
    console.error("Like error:", error)
    res.status(500).json({ error: "Failed to like user" })
  }
})

/**
 * POST /api/matches/super-like/:targetId
 * Send a super like to a user profile
 */
router.post("/super-like/:targetId", authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId)
    const targetUser = await User.findById(req.params.targetId)

    if (!currentUser || !targetUser) {
      return res.status(404).json({ error: "User not found" })
    }

    // Check if already liked
    if (currentUser.likes.includes(req.params.targetId)) {
      return res.status(400).json({ error: "Already interacted with this user" })
    }

    // Add to likes (super like counts as a like)
    currentUser.likes.push(req.params.targetId)
    if (!currentUser.superLikes) {
      currentUser.superLikes = []
    }
    currentUser.superLikes.push(req.params.targetId)
    await currentUser.save()

    // Check if target user also likes current user (mutual match)
    if (targetUser.likes.includes(req.userId)) {
      // Create match
      const match = new Match({
        user1: req.userId,
        user2: req.params.targetId,
      })
      await match.save()

      // Add to matches
      currentUser.matches.push(req.params.targetId)
      targetUser.matches.push(req.userId)
      await currentUser.save()
      await targetUser.save()

      return res.json({ matched: true, message: "It's a super match!", isSuperLike: true })
    }

    res.json({ matched: false, message: "Super like sent", isSuperLike: true })
  } catch (error) {
    console.error("Super like error:", error)
    res.status(500).json({ error: "Failed to super like user" })
  }
})

/**
 * POST /api/matches/dislike/:targetId
 * Dislike/skip a user profile
 */
router.post("/dislike/:targetId", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    if (user.dislikes.includes(req.params.targetId)) {
      return res.status(400).json({ error: "Already disliked this user" })
    }

    user.dislikes.push(req.params.targetId)
    await user.save()

    res.json({ message: "User skipped" })
  } catch (error) {
    console.error("Dislike error:", error)
    res.status(500).json({ error: "Failed to skip user" })
  }
})

/**
 * GET /api/matches
 * Get all matches for current user
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const matches = await Match.find({
      $or: [
        { user1: req.userId, status: "active" },
        { user2: req.userId, status: "active" },
      ],
    })
      .populate("user1", "-password -blockedUsers")
      .populate("user2", "-password -blockedUsers")
      .sort({ matchedAt: -1 })

    res.json(matches)
  } catch (error) {
    console.error("Fetch matches error:", error)
    res.status(500).json({ error: "Failed to fetch matches" })
  }
})

/**
 * DELETE /api/matches/:matchId
 * Unmatch a user
 */
router.delete("/:matchId", authMiddleware, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId)
    if (!match) {
      return res.status(404).json({ error: "Match not found" })
    }

    // Verify user is part of this match
    if (match.user1.toString() !== req.userId && match.user2.toString() !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    // Update match status
    match.status = "unmatched"
    match.unmatchedAt = new Date()
    await match.save()

    // Remove from matches arrays
    const otherUserId = match.user1.toString() === req.userId ? match.user2 : match.user1
    await User.findByIdAndUpdate(req.userId, { $pull: { matches: otherUserId } })
    await User.findByIdAndUpdate(otherUserId, { $pull: { matches: req.userId } })

    res.json({ message: "Unmatched successfully" })
  } catch (error) {
    console.error("Unmatch error:", error)
    res.status(500).json({ error: "Failed to unmatch" })
  }
})

module.exports = router
