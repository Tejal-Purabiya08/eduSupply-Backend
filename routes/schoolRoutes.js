const express = require("express");
const School = require("../model/school");

const router = express.Router();

/* =========================
   GET ALL
========================= */
router.get("/", async (req, res) => {
  try {
    const schools = await School.find();
    res.json(schools);
  } catch (err) {
    res.status(500).json(err);
  }
});

/* =========================
   CREATE SCHOOL + AUTO CODE
========================= */
router.post("/", async (req, res) => {
  try {
    const { name, address, phone, city, state } = req.body;

    // 🔥 Generate unique code
    const prefix = name.substring(0, 3).toUpperCase();
    const randomNumber = Math.floor(100 + Math.random() * 900);
    const schoolCode = prefix + randomNumber;

    const newSchool = new School({
      name,
      address,
      phone,
      city,
      state,
      schoolCode
    });

    const saved = await newSchool.save();
    res.status(201).json(saved);

  } catch (err) {
    res.status(500).json(err);
  }
});

/* =========================
   UPDATE
========================= */
router.put("/:id", async (req, res) => {
  try {
    const updated = await School.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json(err);
  }
});

/* =========================
   DELETE
========================= */
router.delete("/:id", async (req, res) => {
  try {
    await School.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted Successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/current", async (req, res) => {
  try {
    const school = await School.findOne(); // first school
    res.json(school);
  } catch (err) {
    res.status(500).json({ message: "Error fetching school" });
  }
});

module.exports = router;