import mongoose from 'mongoose';

const address = new mongoose.Schema(
  {
      country: {
          type: String,
          required: true,
          default: "Ethiopia"
      },
      city: {
          type: String,
          required: true
      },
      streetName: {
          type: String,
      },
      location :{
          type: { type: String, default: 'Point' }, //geoSpatial point
          coordinates: [Number] //[longitude, latitude] in this order
      },
      houseNumber: {
          type: String,
          default: "new"
      }
  }
);
address.index({ 'location': '2dsphere' });

const propertySchema = mongoose.Schema({
  propertyType: {
    type: String,
    enum: ["single_room", "condominum", "villa", "apartama", "other"]
  },
  pics: {
    type: [String],
    default: []
  },
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "RenterProfile"
  },
  price: {
    type: Number,
    required: true,
  },
  numberOfRooms: {
    type: Number,
    required: true,
    min: [1, "incorrect number of rooms"]
  },
  description: {
    type: String,
    required: true,
    minlenght: [24, "use at least 24 charactes to describe your property"]
  },
  status: {
    type: String,
    enum: ["Available", "NotListed", "Rented"],
    default: "Free"
  },
  amenities: {
    type: [String],
    default: []
  },
  maxOcupantAllowed: {
    type: Number,
    default: 1
  },
  address: {
    type: address,
    required: true
  },
  allowCalling: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });


const propertyModel = mongoose.model('Propery', propertySchema);

export default propertyModel;