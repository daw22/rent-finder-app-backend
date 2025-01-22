import  mongoose from "mongoose";

const RefreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  deviceName: { type: String, required: true },
  ipAddress: { type: String },
  country: { type: String },
  region: { type: String },
  city: { type: String },
  browser: { type: String },
  os: { type: String },
  issuedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
});

export default mongoose.model("RefreshToken", RefreshTokenSchema);