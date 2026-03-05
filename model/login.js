const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ["admin", "parent"],
    default: "parent"
  }
});

module.exports = mongoose.model("userDatas", userSchema);