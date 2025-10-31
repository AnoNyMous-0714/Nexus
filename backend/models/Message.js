/**
 * Message model - stores chat messages between matched users
 */
const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema(
  {
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true },
)

// Index for efficient message queries
messageSchema.index({ match: 1, createdAt: -1 })
messageSchema.index({ recipient: 1, isRead: 1 })

module.exports = mongoose.model("Message", messageSchema)
