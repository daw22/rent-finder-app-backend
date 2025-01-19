import { GraphQLError } from "graphql";
import { customAlphabet } from 'nanoid';
import Account from "../../models/accounts.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import RegisterRequest from "../../models/registerRequest.js";
import { validEmail, getMailOptions, getTransport } from '../../utils/mail.js';

const authResolvers={
  Query: {
    me: async()=> {
      return "dawit"
    }
  },
  Mutation: {
    requestRegistration: async (_, args)=>{
      try{
        const { email } = args;
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
        // save request to DB
        const regRequest = new RegisterRequest({email, token: tokenHashed, expiration});
        await regRequest.save();
        // send token via email
        const mailRequest = getMailOptions(email, token);
        getTransport().sendMail(mailRequest);
        console.log("token:", token);
        return {success: true};
      }catch(error){
        throw new GraphQLError(error.message);
      }
    },
    register: async(_, args)=>{
      try{
        const { userName, email, role, password} = args;
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