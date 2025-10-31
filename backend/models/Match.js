/**
 * Match model - tracks mutual likes between users
 */
const mongoose = require("mongoose")

const matchSchema = new mongoose.Schema(
  {
    user1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "unmatched"],
      default: "active",
    },
    matchedAt: {
      type: Date,
      default: Date.now,
    },
    unmatchedAt: Date,
    lastMessageAt: Date,
  },
  { timestamps: true },
)

// Ensure unique matches (prevent duplicate matches)
matchSchema.index({ user1: 1, user2: 1 }, { unique: true })

module.exports = mongoose.model("Match", matchSchema)
