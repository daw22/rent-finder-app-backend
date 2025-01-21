import jwt from 'jsonwebtoken';
import Account from '../models/accounts.js';
import AkerayProfile from '../models/akerayProfile.js';
import TekerayProfile from '../models/tekerayProfile.js';

// return user profile from token
// if token is wrong or expired(invalid) return null
// if token is valid but profile dosen't exist return { profile: null}
// if token is valid and profile exist return { profile }
export const getUser = async (token)=>{
  try{
    // verify token
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload) return null;
    const { email, tokenExpiraionDate } = payload;
    // check if token is expired
    if (tokenExpiraionDate < new Date()) return null;
    // get account
    const account = await Account.findOne({ email });
    if (!account) return null;
    let profile = null;
    if (account.role === 'akeray'){
      if (account.profile){
        profile = await AkerayProfile.findOne({_id: account.profile});
      }
    }
    if (account.role === 'tekeray'){
      profile = await TekerayProfile.findOne({_id: account.profile});
    }
    return { profile, accountId: account._id };
  }catch(error){
    return null;
  }
}
// creates token
export const createToken = (userAccount)=>{
  // create expiration date 24h
  const expirationDate = new Date;
  expirationDate.setHours(new Date().getHours() + 24);
  // payload
  const payload = { email: userAccount.email, expirationDate};
  return jwt.sign(payload, process.env.JWT_SECRET);
}