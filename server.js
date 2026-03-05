const express=require("express")
const app=express()
const db=require("./config/db")
const cors=require("cors")
const U_router = require("./routes/adminRoutes")
const router = require("./routes/schoolRoutes")
const P_router = require("./routes/parentRoutes")
const D_router = require("./routes/dashboardRoutes")
const UF_router = require("./routes/uniformRoutes")
const C_router = require("./routes/cartRoute")
const O_router = require("./routes/orderRoute")
app.use(cors())
app.use(express.json())
app.use("/uploads", express.static("uploads"));

app.use("/user",U_router)
app.use("/schools",router)
app.use("/parent",P_router)
app.use("/dashboard",D_router );
app.use("/uniform", UF_router);
app.use("/cart", C_router)
app.use("/orders",O_router)

app.listen(5000,()=>{
    console.log("server listen")
})