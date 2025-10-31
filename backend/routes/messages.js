/**
 * Messaging routes
 * Handles sending and retrieving messages
 */
const express = require("express")
const Message = require("../models/Message")
const Match = require("../models/Match")
const authMiddleware = require("../middleware/auth")

const router = express.Router()

/**
 * POST /api/messages
 * Send a message
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { matchId, content } = req.body

    if (!matchId || !content) {
      return res.status(400).json({ error: "Match ID and content required" })
    }

    const match = await Match.findById(matchId)
    if (!match) {
      return res.status(404).json({ error: "Match not found" })
    }

    // Verify user is part of this match
    const isUser1 = match.user1.toString() === req.userId
    const isUser2 = match.user2.toString() === req.userId

    if (!isUser1 && !isUser2) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    const recipient = isUser1 ? match.user2 : match.user1

    const message = new Message({
      match: matchId,
      sender: req.userId,
      recipient,
      content,
    })

    await message.save()

    // Update match's last message time
    match.lastMessageAt = new Date()
    await match.save()

    res.status(201).json(message)
  } catch (error) {
    console.error("Send message error:", error)
    res.status(500).json({ error: "Failed to send message" })
  }
})

/**
 * GET /api/messages/:matchId
 * Get messages for a match
 */
router.get("/:matchId", authMiddleware, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId)
    if (!match) {
      return res.status(404).json({ error: "Match not found" })
    }

    // Verify user is part of this match
    if (match.user1.toString() !== req.userId && match.user2.toString() !== req.userId) {
      return res.status(403).json({ error: "Unauthorized" })
    }

    const messages = await Message.find({ match: req.params.matchId }).sort({ createdAt: 1 }).lean()

    // Mark messages as read
    await Message.updateMany(
      { match: req.params.matchId, recipient: req.userId, isRead: false },
      { isRead: true, readAt: new Date() },
    )

    res.json(messages)
  } catch (error) {
    console.error("Fetch messages error:", error)
    res.status(500).json({ error: "Failed to fetch messages" })
  }
})

/**
 * GET /api/messages/unread/count
 * Get unread message count
 */
router.get("/unread/count", authMiddleware, async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.userId,
      isRead: false,
    })

    res.json({ unreadCount: count })
  } catch (error) {
    console.error("Unread count error:", error)
    res.status(500).json({ error: "Failed to fetch unread count" })
  }
})

module.exports = router
