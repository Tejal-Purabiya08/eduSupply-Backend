const express = require("express");

const school = require("../model/school");
const parent = require("../model/parent");
const uniformModel = require("../model/uniformModel");
const OrderModel = require("../model/OrderModel");

const D_router = express.Router();

D_router.get("/stats", async (req, res) => {

  try {

    // ===== COUNTS =====
    const schoolCount = await school.countDocuments();
    const parentCount = await parent.countDocuments();
    const uniformCount = await uniformModel.countDocuments();

    // ===== ORDERS =====
    const pastCount = await OrderModel.countDocuments({
      paymentStatus: "Paid"
    });

    const newCount = await OrderModel.countDocuments({
      createdAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    });

    // ===== REVENUE TOTAL =====
    const revenueAgg = await OrderModel.aggregate([
      {
        $match: {
          paymentStatus: "Paid"
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" }
        }
      }
    ]);

    const revenue = revenueAgg[0]?.total || 0;

    // ===== REVENUE CHART DATA =====
    const revenueChart = await OrderModel.aggregate([
      {
        $match: {
          paymentStatus: "Paid"
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          revenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // ===== RECENT ORDERS =====
    const recentOrders = await OrderModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      schoolCount,
      parentCount,
      uniformCount,
      pastCount,
      newCount,
      revenue,
      revenueChart,
      recentOrders
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }

});

module.exports = D_router;