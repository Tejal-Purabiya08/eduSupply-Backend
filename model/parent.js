const mongoose = require("mongoose");

const parentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  childName: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true
  },

  password: {
    type: String,
    required: true
  },

  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
  },

  loginOtp: String,
  loginOtpExpires: Date

}, { timestamps: true });

/* 🔥 Composite Unique Index */
// parentSchema.index({ email: 1, schoolId: 1 }, { unique: true });

module.exports = mongoose.model("Parent", parentSchema);