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
    createAkerayProfile: async (_, args, context)=>{
      try{
        const { firstName, lastName, gender, phoneNumber, city} = args;
        // getuser
        const user = context.user;
        if(!user) throw new GraphQLError("unauthorized");
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
    updateAkerayProfile: async (_, args, context)=>{
      try{
        const {username, firstName, lastName, phoneNumber, city} = args;
        // get user
        const user = context.user;
        console.log("user:", user);
        if (!user) throw new GraphQLError("unauthorized");
        // Update fields if provided
        const updates = {};
        if (firstName) updates.firstName = firstName;
        if (lastName) updates.lastName = lastName;
        if (phoneNumber) updates.phoneNumber = phoneNumber;
        if (city) updates.city = city;
        
        // Validate and update username
        if (username) {
          const usernameExists = await Account.exists({ username });
          if (usernameExists && usernameExists._id.equals(user.accountId)) throw new GraphQLError("already using this username")
          if (usernameExists) throw new GraphQLError("Username already taken");
          await Account.findOneAndUpdate({ _id: user.accountId }, { username });
        }
        let updatedProfile = {};
        if (Object.keys(updates).length > 0){
          updatedProfile = await AkerayProfile.findOneAndUpdate(
            {_id: user.profile._id},
            {$set: updates},
            {new: true}
          );
        }else{
          updatedProfile = await AkerayProfile.findOne({_id: user.profile._id});
        }
        console.log("updated:", updatedProfile);
        return {
          firstName: updatedProfile.firstName,
          lastName: updatedProfile.lastName,
          phoneNumber: updatedProfile.phoneNumber,
          city: updatedProfile.city,
          profilePic: updatedProfile.profilePic,
          ...(username != null && {username})
        }
      }catch(error){
        throw new GraphQLError(error.message)
      }
    }
  }
}

export default AkerayProfileResolvers;