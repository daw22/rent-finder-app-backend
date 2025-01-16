import mongoose from 'mongoose';

const propertySchema = mongoose.Schema({
  pics: {
    type: [String],
    default: []
  },
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "Profile"
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
    enum: ["Free", "Rented"],
    default: "Free"
  },
  amenities: {
    type: [String],
    default: []
  },
  maxOcupant: {
    type: Number,
    default: 1
  }
}, { timestamps: true });


const propertyModel = mongoose.model('Propery', propertySchema);

export default propertyModel;