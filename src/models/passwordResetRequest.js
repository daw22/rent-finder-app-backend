import mongoose from "mongoose";

const passwordResetRequestSchema = mongoose.Schema({
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
  code: {
    type: String,
    required: true
  },
  expiration: {
    type: Date,
    required: true
  }
});

export default mongoose.model("PasswordResetRequest", passwordResetRequestSchema);