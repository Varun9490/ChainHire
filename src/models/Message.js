import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    index: true,
  },
  messageType: {
    type: String,
    enum: ["text", "image", "audio", "emoji"],
    default: "text",
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  metadata: {
    duration: Number, // For audio messages
    dimensions: {
      width: Number,
      height: Number,
    }, // For images
  },
  readBy: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

// Add indexes for better query performance
messageSchema.index({ jobId: 1, timestamp: 1 });

const Message =
  mongoose.models.Message || mongoose.model("Message", messageSchema);

export default Message;
