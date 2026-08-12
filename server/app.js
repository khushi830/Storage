require("dotenv").config();
const express=require("express");
const app=express();

const cros=require("cors");

const route=require("./routes/record.route");
const Port=process.env.Port|| 5000;app.use(express.json());
app.use(cros());
app.use('/',route);

app.listen(Port,()=>{
    try{
        console.log(`server is running on : http://localhost:${Port}/`);

    }catch(err){
        console.log(err);
    }
})