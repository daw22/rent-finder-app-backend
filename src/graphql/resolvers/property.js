import Property from "../../models/property.js";
import AkerayProfile from "../../models/akerayProfile.js";
import { GraphQLError } from "graphql";

const propertyResolvers = {
  Mutation: {
    createProperty: async (_, args, { user })=>{
      try{
        if (!user?.profile) throw new Error("unauthorized");
        if (!user.profile.properties) throw new Error("only land-loards can add property!");
        // create address
        const address = {};
        if (args.country) address.country = args.country;
        if (args.city) address.city = args.city;
        if (args.streetName) address.streetName = args.streetName;
        if (args.location) address.location = args.location;
        if (args.houseNumber) address.houseNumber = args.houseNumber;
        const newProperty = await Property.create({...args, owner: user.profile._id, address});
        if (newProperty){
          const updatedProperty = await AkerayProfile.updateOne(
            {_id: user.profile._id},
            {$push: {properties: newProperty._id}}
          );
          return newProperty;
        }else{
          throw new Error("cant add property");
        }
      }catch(error){
        console.log(error.message);
        throw new GraphQLError(error.message);
      }
    }
  }
}

export default propertyResolvers;