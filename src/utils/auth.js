import jwt from 'jsonwebtoken';
import Account from '../models/accounts.js';
import AkerayProfile from '../models/akerayProfile.js';
import TekerayProfile from '../models/tekerayProfile.js';
import RefreshToken from '../models/refreshToken.js';

import geoip from "geoip-lite";
import { UAParser } from "ua-parser-js";

// return user profile from token
// if token is wrong or expired(invalid) return null
// if token is valid but profile dosen't exist return { profile: null}
// if token is valid and profile exist return { profile }
export const getUser = async (token)=>{
  try{
    // verify token
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload) return null;
    const { email } = payload;
    // get account
    const account = await Account.findOne({ email });
    if (!account) return null;
    let profile = null;
    if (account.role === 'akeray'){
      if (account.profile)
        profile = await AkerayProfile.findOne({_id: account.profile});
    }
    if (account.role === 'tekeray'){
      if (account.profile)
        profile = await TekerayProfile.findOne({_id: account.profile});
    }
    return { profile, accountId: account._id };
  }catch(error){
    console.log(error.message);
    return null;
  }
}
// creates token
export const createToken = (userAccount)=>{
  // payload
  const payload = { email: userAccount.email};
  return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "15m"});
}

// create a refresh token
export const createAndSaveRefershToken = async (req, userAccount)=>{
  // sign the token
  const token = jwt.sign(
    {email: userAccount.email, userId: userAccount._id},
    process.env.JWT_REFRESH_SECRET,
    {expiresIn: "7d"}
  );
  // Extract metadata from the request
  const deviceName = req.headers["user-agent"] || "Unknown Device";
  const ipAddress = req.ip === "::1" ? "127.0.0.1" : req.ip;
  // for loopback address
  if (process.env.NODE_ENV === 'production' && ipAddress === "127.0.0.1")
    throw new Error("invalid ip");
  // extract location info from ip
  const geo = geoip.lookup(ipAddress);
  const country = geo ? geo.country : "Unknown";
  const region = geo ? geo.region : "Unknown";
  const city = geo ? geo.city : "Unknown";
  // extract device info from user-agent
  const deviceParser = new UAParser(deviceName) || "unknown";
  const browser = deviceParser.getBrowser() || "unknown";
  const device = deviceParser.getDevice() || "unknown";
  const os = deviceParser.getOS() || "unknown";
  // save refresh token
  await RefreshToken.create({
    token,
    userId: userAccount._id,
    deviceName: device,
    ipAddress,
    country,
    region,
    city,
    browser,
    os,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  })
  return token;
}