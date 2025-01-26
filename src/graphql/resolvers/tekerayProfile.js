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
  }
}

export default tekerayProfileResolvers;