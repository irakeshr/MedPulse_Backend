const mongoose = require("mongoose");

const doctorProfileSchema = new mongoose.Schema(
  {
    // ... (Previous fields remain the same)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    displayName: { type: String, required: true },
    profileImage: { type: String }, // Changed from fullName to displayName
    specialization: { type: String, required: true },
    qualifications: [{ type: String }],
    experienceYears: { type: Number, required: true },
    licenseNumber: { type: String, required: true },
    contactNumber: { type: String, required: true },
    profileBio: { type: String },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected","profilePending"],
      default: "profilePending",
    },

    // 1. PENDING REVIEWS (The "To-Do" List)
    reviewQueue: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],

    // 2. SOLVED CASES (The "Done" List) - NEW ADDITION
    // We move the post ID here after the doctor comments
    solvedCases: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],

    // 3. DASHBOARD STATS
    stats: {
      pendingReviews: { type: Number, default: 0 },
      casesSolved: { type: Number, default: 0 },
      responseTime: { type: String, default: "2h" },
    },

    consultationFee: { type: Number, default: 0 },
    about: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DoctorProfile", doctorProfileSchema);
