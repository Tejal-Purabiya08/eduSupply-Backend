const express = require("express");
const ParentModel = require("../model/parent");
const OrderModel = require("../model/OrderModel");
const CartModel = require("../model/CartModel");

const razorpay = require("razorpay");
const crypto = require("crypto");

const O_router = express.Router();

/* ⭐ Razorpay */
const instance = new razorpay({
  key_id: "rzp_test_XXXXXXX",
  key_secret: "rzp_test_secret"
});


/* ================= PLACE ORDER ================= */

O_router.post("/order", async (req,res)=>{

 try{

   const { parentId, items, deliveryType, address, paymentMethod } = req.body;

   const parentData = await ParentModel
   .findById(parentId)
   .populate("schoolId");

   if(!parentData){
     return res.status(404).json({message:"Parent not found"});
   }

   let totalAmount = 0;

   const formattedItems = items.map(item=>{
     const price = item.uniformId.price;
     const qty = item.quantity;

     totalAmount += price * qty;

     return {
       uniformId:item.uniformId._id,
       name:item.uniformId.name,
       price,
       quantity:qty
     };
   });

   const order = new OrderModel({
     parentId,
     parentName:parentData.name,
     schoolName:parentData.schoolId?.name,
     items:formattedItems,
     totalAmount,
     deliveryType,
     address,
     paymentMethod,
     paymentStatus: paymentMethod === "Online" ? "Paid" : "Pending",
     status:"Pending"
   });

   await order.save();

   /* ⭐ Clear Cart After Order */
   await CartModel.deleteMany({ parentId });

   res.json({
     success:true,
     orderId:order._id
   });

 }catch(err){
   res.status(500).json(err.message);
 }

});


/* ================= GET ORDERS BY PARENT ⭐⭐⭐ (IMPORTANT) */

O_router.get("/orders/:parentId", async(req,res)=>{

 try{

   const orders = await OrderModel
   .find({ parentId:req.params.parentId })
   .populate("items.uniformId")   // ⭐ IMAGE FIX
   .sort({createdAt:-1});

   res.json(orders);

 }catch(err){
   res.status(500).json(err.message);
 }

});


/* ================= PAYMENT CREATE ================= */

O_router.post("/create-payment", async(req,res)=>{

 try{

   const order = await instance.orders.create({
     amount:req.body.amount * 100,
     currency:"INR",
     receipt:"receipt_"+Date.now()
   });

   res.json(order);

 }catch(err){
   res.status(500).json(err.message);
 }

});


/* ================= PAYMENT VERIFY ================= */

O_router.post("/verify-payment", async(req,res)=>{

 try{

   const {
     razorpay_order_id,
     razorpay_payment_id,
     razorpay_signature,
     orderId
   } = req.body;

   const body = razorpay_order_id + "|" + razorpay_payment_id;

   const expected = crypto
   .createHmac("sha256","rzp_test_secret")
   .update(body)
   .digest("hex");

   if(expected === razorpay_signature){

     await OrderModel.findByIdAndUpdate(orderId,{
       paymentStatus:"Paid"
     });

     return res.json({success:true});
   }

   res.status(400).json({message:"Verification failed"});

 }catch(err){
   res.status(500).json(err.message);
 }

});

O_router.get("/admin/orders", async(req,res)=>{

 try{

   const orders = await OrderModel
   .find()
   .sort({createdAt:-1});

   res.json(orders);

 }catch(err){
   res.status(500).json(err.message);
 }

});

module.exports = O_router;