import mongoose from "mongoose";

const registerRequestSchema = mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please enter a valid email address'
    ]
  },
  password:{
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true
  },
  expiration:{
    type: Date,
    required:true
  }
},{ timestamps: true});

const RegisterRequest = mongoose.model("RegistrationRequest", registerRequestSchema);
export default RegisterRequest;