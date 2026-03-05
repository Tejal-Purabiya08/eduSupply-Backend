const express = require("express");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const Parent = require("../model/parent");
const School = require("../model/school");
const history = require("../model/history");

const P_router = express.Router();

/* ================= MAIL ================= */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "tejalpurabiya08@gmail.com",
    pass: "nqhouemojwwwjquz",
  },
});

/* ================= GENERATE OTP ================= */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/* ================= REGISTER ================= */
P_router.post("/register", async (req, res) => {
  try {
    const { name, childName, email, password, schoolCode } = req.body;

    const existing = await Parent.findOne({ email });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const school = await School.findOne({ schoolCode });

    const hash = await bcrypt.hash(password, 10);

    const parent = new Parent({
      name,
      childName,
      email,
      password: hash,
      schoolId: school ? school._id : null,
    });

    await parent.save();

    res.json({
      success: true,
      message: "Registered Successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Registration Failed",
    });
  }
});

/* ================= LOGIN ================= */
P_router.post("/login", async (req, res) => {
  try {
    const { email, password, schoolCode } = req.body;

    // ⭐ Find parent + school populate
    const parent = await Parent.findOne({ email }).populate("schoolId");

    if (!parent) {
      return res.status(400).json({
        success: false,
        message: "Invalid Email",
      });
    }

    // ⭐ Password check
    const match = await bcrypt.compare(password, parent.password);

    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Password",
      });
    }

    // ⭐ SCHOOL SECURITY CHECK (IMPORTANT 🔥)
    if (parent.schoolId?.schoolCode !== schoolCode) {
      return res.status(400).json({
        success: false,
        message: "School Code Not Valid",
      });
    }

    res.json({
      success: true,
      parentId: parent._id,
      parentName: parent.name,
      schoolId: parent.schoolId?._id,
      schoolName: parent.schoolId?.name,
      schoolCode: parent.schoolId?.schoolCode,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Login Failed",
    });
  }
});

/* ================= FORGOT PASSWORD ================= */
P_router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const parent = await Parent.findOne({ email });

    if (!parent) {
      return res.status(400).json({
        success: false,
        message: "Email not found",
      });
    }

    const otp = generateOTP();

    parent.loginOtp = otp;
    parent.loginOtpExpires = new Date(Date.now() + 5 * 60 * 1000);

    await parent.save();

    await transporter.sendMail({
      from: "tejalpurabiya08@gmail.com",
      to: email,
      subject: "Forgot Password OTP",
      text: `Your OTP is: ${otp}`,
    });

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
});

/* ================= VERIFY OTP ================= */
P_router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    const parent = await Parent.findOne({ email });

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent not found",
      });
    }

    if (!parent.loginOtp || parent.loginOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (parent.loginOtpExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP Expired",
      });
    }

    parent.loginOtp = null;
    parent.loginOtpExpires = null;

    await parent.save();

    res.json({
      success: true,
      message: "OTP Verified Successfully",
      parentId: parent._id,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "OTP Verification Failed",
    });
  }
});

/* ================= GET ALL PARENTS ================= */
P_router.get("/parents", async (req, res) => {
  try {
    const parents = await Parent.find().populate("schoolId", "name schoolCode");

    res.json(parents);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Fetch Failed",
    });
  }
});

P_router.delete("/:id", async (req, res) => {
  try {
    await Parent.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Parent Deleted" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Delete Failed",
    });
  }
});

const History = require("../model/history");
const CartModel = require("../model/CartModel");

P_router.put("/change-school/:id", async (req, res) => {

  try {

    const { schoolCode } = req.body;

    const parent = await Parent.findById(req.params.id);

    if (!parent) {
      return res.status(404).json({
        success: false,
        message: "Parent not found"
      });
    }

    const newSchool = await School.findOne({ schoolCode });

    if (!newSchool) {
      return res.status(400).json({
        success: false,
        message: "Invalid School Code"
      });
    }

    // ⭐ Save history (Past + New)
    if (parent.schoolId) {

      await history.create({
        parentId: parent._id,
        oldSchool: parent.schoolId,
        newSchool: newSchool._id
      });

    }

    // ⭐ Update parent school
    parent.schoolId = newSchool._id;
    await parent.save();

    // ⭐ IMPORTANT → Return new data to frontend
    res.json({
      success: true,
      message: "School Changed Successfully",
      schoolId: newSchool._id,
      schoolName: newSchool.name,
      schoolCode: newSchool.schoolCode
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Change Failed"
    });
  }

});

P_router.get("/history", async (req, res) => {
  const data = await history.find().populate("parentId").populate("oldSchool");

  res.json(data);
});

P_router.delete("/delete-account/:id", async (req,res)=>{

 try{

   await Parent.findByIdAndDelete(req.params.id);

   res.json({
     success:true,
     message:"Account Deleted Permanently"
   });

 }catch(err){
   res.status(500).json({
     success:false,
     message:"Delete Failed"
   });
 }

});

P_router.get("/parents-with-orders", async (req, res) => {
  try {

    const parents = await Parent.find()
      .sort({ createdAt: -1 }) // ⭐ Newest parent on top
      .populate("schoolId");

    const parentsWithOrders = await Promise.all(
      parents.map(async (parent) => {

        const cartCount = await CartModel.countDocuments({
          parentId: parent._id
        });

        return {
          ...parent._doc,
          orderCount: cartCount
        };

      })
    );

    res.json(parentsWithOrders);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = P_router;
