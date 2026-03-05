const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({

 parentId: {
   type: mongoose.Schema.Types.ObjectId,
   ref: "Parent"
 },

 childId: String,

 uniformId: {
   type: mongoose.Schema.Types.ObjectId,
   ref: "Uniform"
 },

 size: String,

 quantity: {
   type: Number,
   default: 1
 }

}, { timestamps: true });

module.exports = mongoose.model("Cart", CartSchema);