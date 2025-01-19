import { GraphQLError } from "graphql";
import { customAlphabet } from 'nanoid';
import Account from "../../models/accounts.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import RegisterRequest from "../../models/registerRequest.js";
import { sendEmail, validEmail } from '../../utils/mail.js';

const authResolvers={
  Query: {
    me: async (_, args)=> {
      
    },
    login: async (_, args)=>{
      try{
        const { unOrEmail } = args;
        // check if email or username user for login
        const isEmail = validEmail(unOrEmail);
        // get account

      }catch(error){
        throw new GraphQLError(error.message);
      }
    }
  },
  Mutation: {
    requestRegistration: async (_, args)=>{
      try{
        const { email, password, role } = args;
        // verify if email is valid
        if (!validEmail(email)) throw new GraphQLError("invlaid Email format!");
        // check if registration request already exist for this email and delete if exists
        await RegisterRequest.findOneAndDelete({email});
        // create token and expiration date
        const expiration = new Date();
        expiration.setMinutes(new Date().getMinutes() + 10);
        const nano = customAlphabet('1234567890', 6);
        const token = nano();
        const tokenHashed = await bcrypt.hash(token, 10);
        const passwordHashed = await bcrypt.hash(password, 10);
        // save request to DB
        const regRequest = new RegisterRequest({
          email,
          password: passwordHashed, 
          role, 
          token: tokenHashed, 
          expiration
        });
        await regRequest.save();
        // send token via email
        sendEmail(email, token);
        return {success: true};
      }catch(error){
        throw new GraphQLError(error.message);
      }
    },
    resendToken: async (_, args)=>{
      try{
        const { email } = args;
        // generate new token \
        const nano = customAlphabet('1234567890', 6);
        const token = nano();
        const tokenHashed = await bcrypt.hash(token, 10);
        // update existing request in Db
        const newExpirationDate = new Date();
        newExpirationDate.setMinutes(new Date().getMinutes() + 10);
        const updatedRequest = await RegisterRequest.findOneAndUpdate(
          {email},
          {$set: {token: tokenHashed, expiration: newExpirationDate}},
          {new: true}
        );
        if (!updatedRequest) throw new GraphQLError('request dosen\'t exist');
        // email the new token
        sendEmail(email, token);
        return {success: true};
      }catch(error){
        throw new GraphQLError(error.message);
      }
    },
    register: async (_, args)=>{
      try{
        const { email, token} = args;
        // email already used
        const emailUsed = await Account.findOne({ email });
        if (emailUsed) throw new GraphQLError("Account already registerd with this email.");
        // request exists?
        const regRequest = await RegisterRequest.findOne({ email });
        if (!regRequest) throw new GraphQLError("request dosen't exist.");
        // check if request expired
        if (regRequest.expiration < new Date()) throw new GraphQLError("token expired!");
        // verify token
        const validToken = await bcrypt.compare(token, regRequest.token);
        if (!validToken) throw new GraphQLError("invalid token!");
        // create account and delete request
        const newAccount = new Account({
          username: email.split('@')[0],
          email: email,
          password: regRequest.password,
          role: regRequest.role
        });
        await newAccount.save();
        await RegisterRequest.findOneAndDelete({email});
        // create token and return it
        const tokenExpirationDate = new Date();
        tokenExpirationDate.setHours(new Date().getHours() + 24);
        const newToken = jwt.sign({email, tokenExpirationDate}, process.env.JWT_SECRET);
        return {
          token: newToken
        };
      }catch(error){
        throw new Error(error.message);
      }
      
    }
  }
}


export default authResolvers;