const mongoose=require("mongoose")
// mongoose.connect("mongodb+srv://admin:admin%40123@cluster0.qroqwfz.mongodb.net/schoolDB")
mongoose.connect("mongodb://127.0.0.1:27017/edusupply")
const db=mongoose.connection
db.on("connected",(err,data)=>{
    if(err){
        console.log(err)
    }else{
        console.log("database connect")
    }
})