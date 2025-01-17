import mongoose from "mongoose";

const akerayProfileSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  profilePic: {
    type: String
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    required: true
  },
  phoneNumber: {
    type: String,
    match: [ /^(09|07)[0-9]{8}$/, "please insert a valid phone number."]
  },
  properties: [{
    type: mongoose.Types.ObjectId,
    ref: "Property"
  }]
}, { timestamps: true });

const profileModel = mongoose.model("RenterProfile", akerayProfileSchema);

export default profileModel;