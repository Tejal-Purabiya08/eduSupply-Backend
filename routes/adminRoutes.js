const express = require("express");
const U_router = express.Router();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userData = require("../model/login");

/* ⭐ Import Token Middleware */
const verifyToken = require("../middleware/authMiddleware");

const SECRET_KEY = "mysecretkey";


/* ⭐ REGISTER */
U_router.post("/register", async (req, res) => {

 try {

   const { username, password, role } = req.body;

   const exist = await userData.findOne({ username });

   if (exist) {
     return res.status(400).json({
       message: "User already exists"
     });
   }

   const hashPassword = await bcrypt.hash(password, 10);

   const newUser = new userData({
     username,
     password: hashPassword,
     role
   });

   await newUser.save();

   res.json({
     message: "Registration Success 🎉"
   });

 } catch (err) {
   res.status(500).json({
     message: "Server error"
   });
 }

});


/* ⭐ LOGIN */
U_router.post("/login", async (req, res) => {

 try {

   const { username, password } = req.body;

   const user = await userData.findOne({ username });

   if (!user) {
     return res.status(400).json({
       message: "User not found"
     });
   }

   const match = await bcrypt.compare(password, user.password);

   if (!match) {
     return res.status(400).json({
       message: "Invalid password"
     });
   }

   const token = jwt.sign(
     {
       id: user._id,
       username: user.username,
       role: user.role
     },
     SECRET_KEY,
     { expiresIn: "1d" }
   );

   res.json({
     message: "Login Success",
     token,
     role: user.role
   });

 } catch (err) {
   res.status(500).json({
     message: "Server error"
   });
 }

});


/* ⭐ PROFILE (Protected Route) */
U_router.get("/profile", verifyToken, async (req, res) => {

 try {

   const user = await userData
     .findById(req.user.id)
     .select("-password");

   res.json(user);

 } catch (err) {
   res.status(500).json({
     message: "Error fetching profile"
   });
 }

});

module.exports = U_router;