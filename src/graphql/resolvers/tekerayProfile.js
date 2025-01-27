import TekerayProfile from "../../models/tekerayProfile.js";
import Account from "../../models/accounts.js";
import { GraphQLError } from "graphql";

const tekerayProfileResolvers = {
  Mutation: {
    createTekeryaProfile: async (_, args, context)=>{
      try{
        console.log("here")
        const { firstName, lastName, gender, phoneNumber, city} = args;
        // getuser
        const user = context.user;
        if(!user) throw new GraphQLError("unauthorized");
        if(user.profile) throw new GraphQLError("profile already exists!");
        const newProfile = new TekerayProfile({ firstName, lastName, gender, phoneNumber, city});
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
          profilePic: "",
          idPic: ""
        }
      }catch(error){
        console.log(error.message);
        throw new Error(error.message);
      }
    },
    updateTekerayProfile: async (_, args, context)=>{
      try{
        const {username, firstName, lastName, phoneNumber, city} = args;
        // get user
        const user = context.user;
        if (!user) throw new Error("unauthorized");
        if (!user.profile) throw new Error("profile not created");
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
          updatedProfile = await TekerayProfile.findOneAndUpdate(
            {_id: user.profile._id},
            {$set: updates},
            {new: true}
          );
        }else{
          updatedProfile = await TekerayProfile.findOne({_id: user.profile._id});
        }
        return {
          firstName: updatedProfile.firstName,
          lastName: updatedProfile.lastName,
          phoneNumber: updatedProfile.phoneNumber,
          city: updatedProfile.city,
          profilePic: updatedProfile.profilePic,
          ...(username != null && {username})
        }
      }catch(error){
        console.log(error.message)
        throw new GraphQLError(error.message)
      }
    }
  }
}

export default tekerayProfileResolvers;