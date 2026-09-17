require("dotenv").config();
const express=require("express");
const cors=require("cors");

const app=express();
const route=require("./routes/record.route");

const PORT=process.env.Port;

const allowedOrigins=process.env.CORS_ORIGIN.split(",");

app.use(express.json());

app.use(cors({
    origin:function(origin,callback){
        if(!origin||allowedOrigins.includes(origin)){
            callback(null,true);
        }else{
            callback(new Error("Not allowed by CORS"));
        }
    }
}));

app.use("/",route);

app.listen(PORT,"0.0.0.0",()=>{
    console.log(`Server is running on port ${PORT}`);
});