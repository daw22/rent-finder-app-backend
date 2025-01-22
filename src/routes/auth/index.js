import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Account from "../../models/accounts.js";
import PasswordResetRequest from "../../models/passwordResetRequest.js";

const route = express.Router();

route.get("/", (req, res)=> res.send("Auth routes"));

route.get("/reset-password", (req, res)=> res.send("password reset"));

route.post("/reset-password", async (req, res)=> {
  try{
    const token  = req.query.rst;
    const { newPassword } = req.body;
    // decode token
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload) throw new Error("invalid token");
    // check token for expiration
    if (new Date(payload.expiration) < new Date()) throw new Error("token expired");
    // get the account
    const userAccount = await Account.findOne({email: payload.email});
    if (!userAccount) throw new Error("user account not found");
    // change the pasword
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await Account.findOneAndUpdate({email: payload.email}, {$set: {password: newHashedPassword}});
    // delete request
    await PasswordResetRequest.findOneAndDelete({email: payload.email});
    return res.status(201).send();
  }catch(error){
    console.log(error.message);
    res.status(400).json({"message": "invalid magic link"});
  }
});

export default route;