const express = require("express");
const Cart = require("../model/CartModel");

const C_router = express.Router();

/* ⭐ ADD TO CART */
C_router.post("/add", async (req, res) => {
  try {
    const { parentId, uniformId, size } = req.body;

    const exists = await Cart.findOne({
      parentId,
      uniformId,
      size,
    });

    if (exists) {
      return res.json({
        message: "Already in cart",
      });
    }

    const cart = new Cart({
      parentId,
      uniformId,
      size,
      quantity: 1, // ⭐ Default 1
    });

    await cart.save();

    res.json(cart);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

/* ⭐ GET CART */
C_router.get("/:parentId", async (req,res)=>{

 const cart = await Cart.find({
   parentId:req.params.parentId
 })
 .populate("uniformId");

 res.json(cart);

});

/* ⭐ INCREASE QUANTITY */
C_router.put("/increase/:id", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id);

    cart.quantity += 1;

    await cart.save();

    res.json(cart);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

/* ⭐ DECREASE QUANTITY */
C_router.put("/decrease/:id", async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id);

    if (cart.quantity > 1) {
      cart.quantity -= 1;
    }

    await cart.save();

    res.json(cart);
  } catch (err) {
    res.status(500).json(err.message);
  }
});

/* ⭐ CLEAR CART AFTER ORDER */
C_router.delete("/clear/:parentId", async (req,res)=>{
  try{
    await Cart.deleteMany({
      parentId:req.params.parentId
    });

    res.json({message:"Cart Cleared"});
  }catch(err){
    res.status(500).json(err.message);
  }
});

module.exports = C_router;