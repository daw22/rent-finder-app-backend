import { GraphQLError } from "graphql";
import { customAlphabet } from 'nanoid';
import Account from "../../models/accounts.js";
import AkerayProfile from "../../models/akerayProfile.js";
import TekerayProfile from "../../models/tekerayProfile.js";
import bcrypt from "bcrypt";
import RegisterRequest from "../../models/registerRequest.js";
import { sendEmail, validEmail } from '../../utils/mail.js';
import { createToken } from "../../utils/auth.js";

const authResolvers={
  LoginResult: {
    __resolveType(obj){
      if (obj.properties) return 'AkerayProfile'
      if (obj.idPic) return 'TekerayProfile'
      return null;
    }
  },
  Query: {
    login: async (_, args)=>{
      try{
        const { unOrEmail, password } = args;
        // check if email or username is used for login
        const isEmail = validEmail(unOrEmail);
        // get account
        let userAccount;
        if (isEmail)
          userAccount = await Account.findOne({email: unOrEmail});
        else
          userAccount = await Account.findOne({username: unOrEmail});
        if (!userAccount) throw new GraphQLError("Wrong creadentials");
        // validate password
        const validPassword = await bcrypt.compare(password, userAccount.password);
        if (!validPassword) {console.log("wrong password");throw new GraphQLError("Wrong credentials");}
        // sign token
        const token = createToken(userAccount);
        // get profile of loged in user
        let userProfile;
        if (!userAccount.profile) {
          userProfile = null;
        } else if (userAccount.role === "akeray") {
          userProfile = await AkerayProfile.findOne({_id: userAccount.profile});
        } else if (userAccount.role === "tekeray") {
          userProfile = await TekerayProfile.findOne({_id: userAccount.profile});
        }
        return { profile: userProfile, token };
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
        console.log("saved hash:", passwordHashed);
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
        console.log(error.message);
        return {success: true};
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
        console.log(error.message);
        return {success: false};
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
        console.log(regRequest.password);
        if (!regRequest) throw new GraphQLError("request dosen't exist.");
        // check if request expired
        if (regRequest.expiration < new Date()) throw new GraphQLError("token expired!");
        // verify token
        const validToken = await bcrypt.compare(token, regRequest.token);
        if (!validToken) throw new GraphQLError("invalid token!");
        // create random username
        const nano = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz', 8);
        // create account and delete request
        const newAccount = new Account({
          username: nano(),
          email: email,
          password: regRequest.password,
          role: regRequest.role
        });
        await newAccount.save();
        await RegisterRequest.findOneAndDelete({email});
        // create token and return it
        const newToken = createToken({email});
        return {
          token: newToken
        };
      }catch(error){
        console.log(error.message);
        return {token: null}
      }
      
    },
    changePassword: async (_, args, context)=>{
      try{
        const { oldPassword, newPassword } = args;
        // check if the user is loged in
        const user = context.user;
        if(!user) throw new GraphQLError("unauthorized");
        // check if old password is write
        const userAccount = await Account.findById(user.accountId);
        const correctPassword = await bcrypt.compare(oldPassword,userAccount.password);
        if (!correctPassword) throw new GraphQLError("unauthorized");
        // save new password
        const newPasswordHashed = await bcrypt.hash(newPassword, 10);
        await Account.findByIdAndUpdate(user.accountId, {password: newPasswordHashed});
        return {success: true};
      }catch(error){
        console.log(error.message);
        return {success: false};
      }
    }
  }
}


export default authResolvers;