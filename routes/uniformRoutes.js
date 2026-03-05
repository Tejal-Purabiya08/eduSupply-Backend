const express = require("express");
const multer = require("multer");
const path = require("path");

const uniformModel = require("../model/uniformModel");

const UF_router = express.Router();

/* ================= MULTER ================= */

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

/* ================= ADD UNIFORM ================= */

UF_router.post("/", upload.single("image"), async (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        message: "Image required"
      });
    }

    const uniform = new uniformModel({
      schoolId: req.body.schoolId,
      className: req.body.className,
      gender: req.body.gender,
      house: req.body.house,
      season: req.body.season,
      price: req.body.price,
      description: req.body.description,
      sizeCategory: req.body.sizeCategory,
      image: req.file.filename,
      status: "active"
    });

    const saved = await uniform.save();

    res.status(201).json(saved);

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

/* ================= FILTER UNIFORMS ================= */

UF_router.post("/filter", async (req, res) => {

  try {

    let query = {};

    if (req.body.schoolId)
      query.schoolId = req.body.schoolId;

    if (req.body.className)
      query.className = req.body.className;

    if (req.body.gender)
      query.gender = req.body.gender;

    if (req.body.house && req.body.house !== "Any")
      query.house = req.body.house;

    if (req.body.season && req.body.season !== "Any")
      query.season = req.body.season;

    if (req.body.sizeCategory)
      query.sizeCategory = req.body.sizeCategory;

    query.status = "active"; // ⭐ show only active products

    const data = await uniformModel
      .find(query)
      .populate("schoolId", "name");

    res.json(data);

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});

/* ================= GET BY SCHOOL ================= */

UF_router.get("/by-school/:schoolId", async (req, res) => {

  try {

    const data = await uniformModel.find({
      schoolId: req.params.schoolId
    });

    res.json(data);

  } catch (err) {
    res.status(500).json(err.message);
  }

});

/* ================= SINGLE ================= */

UF_router.get("/single/:id", async (req, res) => {

  try {

    const uniform = await uniformModel.findById(req.params.id);

    if (!uniform) {
      return res.status(404).json({
        message: "Not found"
      });
    }

    res.json(uniform);

  } catch (err) {
    res.status(500).json(err.message);
  }

});

/* ================= STATUS ================= */

UF_router.put("/status/:id", async (req, res) => {

  await uniformModel.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status }
  );

  res.json({ success: true });

});

/* ================= DELETE ================= */

UF_router.delete("/:id", async (req, res) => {

  await uniformModel.findByIdAndDelete(req.params.id);

  res.json({ success: true });

});

module.exports = UF_router;