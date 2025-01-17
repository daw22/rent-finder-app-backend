import express from 'express';
import dotenv from 'dotenv';

import connectDB from './utils/dbConnect.js';

dotenv.config();
const app = express();

app.get("/", (req,res)=>{
  res.send("hello world!");
})
connectDB();
app.listen(process.env.PORT || 5000, ()=> console.log("server running on port 5000"));