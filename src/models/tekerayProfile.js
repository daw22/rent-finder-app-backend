import mongoose from "mongoose";

const tekerayProfileSchema = mongoose.Schema({
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
  idPic: {
    type: string // picture of tekeray id
  }
}, { timestamps: true });

const profileModel = mongoose.model("RenterProfile", tekerayProfileSchema);

export default profileModel;