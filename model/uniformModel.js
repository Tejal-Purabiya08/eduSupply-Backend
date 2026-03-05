const mongoose = require("mongoose");

const uniformSchema = new mongoose.Schema({

  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true
  },

  className: {
    type: String,
    required: true
  },

  gender: {
    type: String,
    required: true,
    enum: ["Male", "Female"]
  },

  house: {
    type: String,
    required: true
  },

  season: {
    type: String,
    required: true,
    enum: ["Summer", "Winter"]
  },

  price: { type: Number, required: true },

  image: { type: String, required: true },

  description: { type: String, required: true },

  sizeCategory: {
    type: String,
    enum: ["Pant", "Jeans", "Blazer"],
    required: true
  },

  status: {
    type: String,
    default: "active"
  }

}, { timestamps: true });

module.exports = mongoose.model("Uniform", uniformSchema);