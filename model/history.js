const mongoose = require("mongoose");

const HistorySchema = new mongoose.Schema({

  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Parent"
  },

  oldSchool: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School"
  },

  newSchool: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("History", HistorySchema);