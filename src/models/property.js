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
        coordinates: { type: [Number], default: [0, 0] } //[longitude, latitude] in this order
    },
    houseNumber: {
        type: String,
        default: "new"
    }
  }
);
address.index({ 'location': '2dsphere' });

function picsNumberLinit(val) {
  return val.length <= 5;
}

function sizeArrayLimit(val) {
  return val.lenght == 2;
}

const propertySchema = mongoose.Schema({
  propertyLabel:{
    type: String
  },
  propertyType: {
    type: String,
    enum: ["single_room", "condominum", "villa", "apartama", "other"],
    required: true
  },
  pics: {
    type: [String],
    default: [],
    validate: [picsNumberLinit, 'maximum if 5 pics per property allowed.']
  },
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "AkerayProfile"
  },
  price: {
    type: Number,
    min: [1, "invalid price"]
  },
  numberOfRooms: {
    type: Number,
    default: 1,
    min: [1, "incorrect number of rooms"]
  },
  description: {
    type: String,
    required: true,
    minlength: [24, "use at least 24 charactes to describe your property"]
  },
  status: {
    type: String,
    enum: ["Available", "NotListed", "Rented"],
    default: "Available"
  },
  utilities: {
    type: [String],
    default: []
  },
  maxOcupantAllowed: {
    type: Number,
    min: [1, "invalid number of ocupants per property."]
  },
  address: {
    type: address,
    required: true
  },
  size: {
    type: [Number],
    default: [0, 0],
    //validate: [sizeArrayLimit, "size needs exactly two numbers"]
  },
  inAdvancePaymentMonths: {
    type: Number,
    default: 1,
    min: [0, "invalid number of months"]
  },
  evacuationNoticeInterval:{
    type: Number,
  },
  preferedTenants: {
    type: String,
    enum: ["student", "family", "couple", "any"],
    default: "any"
  }
}, { timestamps: true });


const propertyModel = mongoose.model('Propery', propertySchema);

export default propertyModel;