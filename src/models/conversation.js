import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  akeray:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "AkerayProfile",
    required: true
  },
  tekeray:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "TekerayProfile",
    required: true
  },
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      isRead: { type: Boolean, default: false}
    },
  ],
  updatedAt: { type: Date, default: Date.now },
  property: {type: mongoose.Schema.Types.ObjectId, ref: "Property"}
});

export default mongoose.model('Conversation', conversationSchema);