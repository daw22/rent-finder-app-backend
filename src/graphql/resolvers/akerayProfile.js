import { GraphQLError } from "graphql";
import AkerayProfile from "../../models/akerayProfile.js";
import { getUser } from "../../utils/auth.js";
import Account from "../../models/accounts.js";

const AkerayProfileResolvers = {
  Query: {
    akerayProfile: async(_, args)=>{
      try{
        const { id } = args;
        const profile = await AkerayProfile.findOne({_id: id});
        if (profile){
          return {
            _id: profile._id,
            firstName: profile.firstName,
            lastName: profile.lastName,
            profilePic: profile.profilePic,
            gender: profile.gender,
            phoneNumber: profile.phoneNumber,
            properties: profile.properties,
            city: profile.city
          }
        }else {
          return null;
        }
      }catch(error){
        throw new Error(error.message);
      }
    }
  },
  Mutation: {
    createAkerayProfile: async (_, args)=>{
      try{
        const { firstName, lastName, gender, phoneNumber, city, token} = args;
        // getuser
        const user = await getUser(token);
        console.log("user:", user);
        if(!user) throw new GraphQLError("invalid token!");
        if(user.profile) throw new GraphQLError("profile already exists!");
        const newProfile = new AkerayProfile({ firstName, lastName, gender, phoneNumber, city});
        const savedProfile = await newProfile.save();
        // update account and link profile
        await Account.findOneAndUpdate(
          {_id: user.accountId},
          {$set: {profile: savedProfile._id}}
        );
        return {
          firstName: newProfile.firstName,
          lastName: newProfile.lastName,
          gender: newProfile.gender,
          phoneNumber: newProfile.phoneNumber,
          city: newProfile.city,
          properties: [],
          profilePic: ""
        }
      }catch(error){
        throw new Error(error.message);
      }
    },
    updateAkerayProfile: async (_, args)=>{
      try{
        const {id, firstName, lastName, phoneNumber, city} = args;
        const oldProfile = await AkerayProfile.findOne({_id: id});
        if (!oldProfile){
          return null;
        }
        if (firstName) oldProfile.firstName = firstName;
        if (lastName) oldProfile.lastName = lastName;
        if (phoneNumber) oldProfile.phoneNumber = phoneNumber;
        if (city) oldProfile.city = city;

        await oldProfile.save();
        return {
          id: oldProfile._id,
          firstName: oldProfile.firstName,
          lastName: oldProfile.lastName,
          phoneNumber: oldProfile.phoneNumber,
          city: oldProfile.city,
          profilePic: oldProfile.profilePic
        }
      }catch(error){
        throw new Error(error.message)
      }
    }
  }
}

export default AkerayProfileResolvers;