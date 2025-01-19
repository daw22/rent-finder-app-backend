import { GraphQLError } from "graphql";
import { customAlphabet } from 'nanoid';
import Account from "../../models/accounts.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import RegisterRequest from "../../models/registerRequest.js";
import { sendEmail } from '../../utils/mail.js';

const authResolvers={
  Query: {
    me: async()=> {
      return "dawit"
    }
  },
  Mutation: {
    requestRegistration: async (_, args)=>{
      try{
        const { email, password } = args;
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
        const regRequest = new RegisterRequest({email, password: passwordHashed, token: tokenHashed, expiration});
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
    register: async(_, args)=>{
      try{
        const { userName, email, role, password, token} = args;
        console.log("args:", args);
        const hashedPassword = await bcrypt.hash(password, 12);

        const newAccount = new Account({ username: userName, email, role, password: hashedPassword});
        await newAccount.save();
        return {
          id: newAccount.id,
          username: newAccount.username,
          email: newAccount.email,
          role: newAccount.role,
        };
      }catch(error){
        throw new Error(error.message);
      }
      
    }
  }
}


export default authResolvers;