const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parent",
      required: true,
    },

    parentName: String,
    schoolName: String,

    items: [
      {
        uniformId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Uniform",
        },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],

    totalAmount: Number,
    deliveryType: String,

    address: {
      name: String,
      phone: String,
      addressLine: String,
      city: String,
      pincode: String,
    },

    paymentMethod: String,

    paymentStatus: {
      type: String,
      default: "Pending",
    },

    status: {
      type: String,
      default: "Pending",
    },

    orderDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);