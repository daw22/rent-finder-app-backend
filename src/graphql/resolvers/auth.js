import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";
import { customAlphabet } from 'nanoid';
import Account from "../../models/accounts.js";
import AkerayProfile from "../../models/akerayProfile.js";
import TekerayProfile from "../../models/tekerayProfile.js";
import passwordResetRequest from "../../models/passwordResetRequest.js";
import RefreshToken from "../../models/refreshToken.js";
import bcrypt from "bcrypt";
import RegisterRequest from "../../models/registerRequest.js";
import { sendEmail, validEmail, sendResetEmail, suspiciousActivityEmail } from '../../utils/mail.js';
import { createToken, createAndSaveRefershToken } from "../../utils/auth.js";

const authResolvers={
  LoginResult: {
    __resolveType(obj){
      if (obj.properties) return 'AkerayProfile'
      if (obj.idPic) return 'TekerayProfile'
      return null;
    }
  },
  Query: {
    login: async (_, args, { req, res })=>{
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
        // set a refresh token
        const refreshToken = await createAndSaveRefershToken(req, userAccount);
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "Strict",
          maxAge: 1000 * 60 * 60 * 24 * 7 // a week
        })
        return { profile: userProfile, token };
      }catch(error){
        throw new GraphQLError(error.message);
      }
    },
    refreshAccessToken: async(_, __, { user, req, res })=>{
      try{
        // get 
        const { refreshToken } = req.cookies;
        
        if (!refreshToken) throw new GraphQLError("Refresh token missing");
        // get payload
        const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        // get refresh token record
        const tokenRecord = await RefreshToken.findOne({ token: refreshToken, userId: user.accountId });
        if (!tokenRecord) throw new GraphQLError("no refresh token found");
        // if revoked(potential hack!)
        if (tokenRecord.revoked){
          // notify user by email
          await suspiciousActivityEmail(user, tokenRecord);
          throw new GraphQLError("revoked token in use!!");
        }
        // issue new token
        const newRefreshToken = await createAndSaveRefershToken(req, {email: payload.email, _id: user.accountId});
        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "Strict",
          maxAge: 1000 * 60 * 60 * 24 * 7 // a week
        });
        // create new access token
        const newAccessToken = createToken({email: payload.email});
        // revoke last token
        tokenRecord.revoked = true;
        await tokenRecord.save();
        return {success: true, token: newAccessToken}
      }catch(error){
        console.log(error.message);
        return {success: false, token: null};
      }
    }
  },
  Mutation: {
    requestRegistration: async (_, args)=>{
      try{
        const { email, password, role } = args;
        // verify if email is valid
        if (!validEmail(email)) throw new GraphQLError("invlaid Email format!");
        // check if registration request already exist for this email and delete if expired
        const existingRequest = await RegisterRequest.findOne({email});
        if (existingRequest){
          // check if it is expired - delete and create new - else throw an error
          if (existingRequest.expiration < new Date()){
             await RegisterRequest.findOneAndDelete({_id: existingRequest._id})
            }else {
              throw new GraphQLError("request already exist and active/not expired");
            }
        }
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
        console.log(error.message);
        return {success: false};
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
    register: async (_, args, { res })=>{
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
        // set a refresh token
        const refreshToken = await createAndSaveRefershToken(req, newAccount);
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: true,
          sameSite: "Strict",
          maxAge: 1000 * 60 * 60 * 24 * 7 // a week
        })
        // create access token and return it
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
    },
    requestPasswordReset: async (_, args)=>{
      try{
        const { email } = args;
        //valid email format?
        const validEmailFormat = validEmail(email);
        if (!validEmail) throw new GraphQLError("invalid email");
        // check if account exist
        const accountExists = await Account.exists({email});
        if (!accountExists) throw new GraphQLError("Account dosen't exist.");
        // request already exists and not expired
        const requestExist = await passwordResetRequest.findOne({email});
        if (requestExist && requestExist.expiration > new Date()) throw new GraphQLError("request already exist");
        // delete expired existing request(if any)
        if (requestExist && requestExist.expiration <= new Date()){
          await passwordResetRequest.findOneAndDelete({_id: requestExist._id});
        } 
        // generate and send(email) token and magic link, with 10min expiration time
        // create the verification code
        const nano = customAlphabet('0123456789', 6);
        const code = nano();
        const hashedCode = await bcrypt.hash(code,10);
        // create the magic link
        const expirationDate = new Date();
        expirationDate.setSeconds(new Date().getSeconds() + 90);
        const token = jwt.sign({email, expiration: expirationDate}, process.env.JWT_SECRET);
        const magicLink = `http://localhost:4000/accounts/reset-password?rst=${token}`;
        await sendResetEmail(email, code, magicLink);
        // save request to DB
        const request = new passwordResetRequest({
          email,
          code: hashedCode,
          token,
          expiration: expirationDate
        });
        await request.save();
        return {success: true};
      }catch(error){
        console.log(error.message);
        return {success: false};
      }
    },
    resetPassword: async(_, args)=>{
      try{
        const { email, code, newPassword } = args;
        // get the password reset request
        const request = await passwordResetRequest.findOne({email});
        if (!request) throw new GraphQLError("request dosen't exist");
        // verify request is not expired
        const requestExpired = request.expiration < new Date();
        if (requestExpired) throw new GraphQLError("request expired");
        // verify token
        const tokenValid = await bcrypt.compare(code, request.code);
        if (!tokenValid) throw new GraphQLError("wrong code!");
        // save new password
        const newPasswordHashed = await bcrypt.hash(newPassword, 10);
        const updatedAccoount = await Account.findOneAndUpdate(
          {email: request.email},
          {$set: {password: newPasswordHashed}},
          {new: true}
        );
        if (!updatedAccoount) throw new GraphQLError("operation failed");
        // delete request
        await passwordResetRequest.findOneAndDelete({email});
        return {success: true};
      }catch(error){
        console.log(error.message);
        if (error.message === "request expired"){
          await passwordResetRequest.findOneAndDelete({email: args.email});
        }
        return {success: false};
      }
    }
  }
}


export default authResolvers;