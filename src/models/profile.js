import mongoose from "mongoose";

const profileSchema = mongoose.Schema({
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
  idPic: {
    type: String,
  },
  phoneNumber: {
    type: String,
    match: [ /^(09|07)[0-9]{8}$/, "please insert a valid phone number."]
  },
}, { timestamps: true });

const profileModel = mongoose.model("Profile", profileSchema);

export default profileModel;