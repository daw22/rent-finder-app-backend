import Property from "../../models/property.js";
import AkerayProfile from "../../models/akerayProfile.js";
import { GraphQLError } from "graphql";
import { get } from "mongoose";

const propertyResolvers = {
  Query:{
    getProperty: async (_, args, {user})=>{
      try{
        if (!user?.profile) throw new Error("unauthorized");
        const { id } = args;
        // get the property
        const property = await Property.findById(id).populate("owner");
        return property;
      }catch(error){
        console.log(error.message);
        throw new GraphQLError(error.message);
      }
    },
    getMyProperties: async (_, __, { user })=>{
      try{
        if (!user?.profile) throw new Error("unauthorized");
        if (!user.profile.properties) throw new Error("not a landloard");
        // get the properties
        const properties = await Property.find({ owner: user.profile._id });
        return properties;
      }catch(error){
        console.log(error.message);
        throw new GraphQLError(error.message)
      }
    },
    getAvailableProperties: async (_, args, { user})=> {
      try{
        if (!user?.profile) throw new Error("uanuthorize");
        const { city, minPrice, maxPrice, propertyType } = args;
        const where = { "address.city": city };
        if (minPrice || maxPrice) where.price = { $gte: minPrice ? minPrice : 0, $lte: maxPrice ? maxPrice : 1000000 };
        if (propertyType) where.propertyType = propertyType;
        // get the properties
        const properties = await Property.find({...where, status: "Available"}).populate("owner");
        return properties;
      }catch(error){
        console.log(error.message);
        throw new GraphQLError(error.message);
      }
    }
  },
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
    },
    updateProperty: async (_, args, { user })=>{
      try{
        if (!user?.profile) throw new Error("unauthorized");
        if (!user.profile.properties) throw new Error("only land-loards can update property!");
        const {id, propertyType, price, numberOfRooms, description, utilities, maxOcupantAllowed, allowCalling, status, preferedTenants} = args;
        const updateObj = {};
        if (propertyType) updateObj.propertyType = propertyType;
        if (price) updateObj.price = price;
        if (numberOfRooms) updateObj.numberOfRooms = numberOfRooms;
        if (description) updateObj.description = description;
        if (utilities) updateObj.utilities = utilities;
        if (maxOcupantAllowed) updateObj.maxOcupantAllowed = maxOcupantAllowed;
        if (allowCalling) updateObj.allowCalling = allowCalling;
        if (status) updateObj.status = status;
        if (preferedTenants) updateObj.preferedTenants = preferedTenants;
        const updatedProperty = await Property.findByIdAndUpdate(id, updateObj, {new: true});
        return updatedProperty;
      }catch(error){
        console.log(error.message);
        throw new GraphQLError(error.message);
      }
    },
    deleteProperty: async (_, args, { user })=>{
      try{
        if (!user?.profile) throw new Error("unauthorized");
        console.log(user.profile.properties.includes(args.propertyId));
        if (!user.profile.properties) throw new Error("only land-loards can delete property!");
        // check if user owns the property
        if (!user.profile.properties.includes(args.propertyId))
          throw new Error("not your property");
        // delete the property
        const deletedProperty = await Property.findByIdAndDelete(args.propertyId);
        if (deletedProperty){
          return true
        }else{
          return false;
        }
      }catch(error){
        console.log(error.message);
        throw new GraphQLError(error.message);
      }
    }
  }
}

export default propertyResolvers;