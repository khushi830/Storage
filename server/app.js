require("dotenv").config();
const express=require("express");
const app=express();

const cros=require("cors");

const route=require("./routes/record.route");
const PORT=process.env.Port;
app.use(express.json());
app.use(cros({
    origin: process.env.CORS_ORIGIN
}));
app.use('/',route);

app.listen(PORT,'0.0.0.0',()=>{
    try{
        console.log(`server is running on : http://localhost:${PORT}/`);

    }catch(err){
        console.log(err);
    }
})