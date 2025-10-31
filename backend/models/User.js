/**
 * User model - stores user profile information
 * Includes authentication, profile data, and preferences
 */
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
      min: 18,
      max: 120,
    },
    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },
    profilePicture: {
      type: String, // Base64 or URL
      default: null,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    interestedIn: {
      type: String,
      enum: ["male", "female", "both"],
      required: true,
    },
    location: {
      latitude: Number,
      longitude: Number,
      city: String,
    },
    preferences: {
      ageMin: { type: Number, default: 18 },
      ageMax: { type: Number, default: 100 },
      maxDistance: { type: Number, default: 50 }, // in km
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    matches: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastActive: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error)
  }
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function () {
  const { password, blockedUsers, ...publicProfile } = this.toObject()
  return publicProfile
}

module.exports = mongoose.model("User", userSchema)
