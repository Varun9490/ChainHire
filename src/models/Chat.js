import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderName: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: "en",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Create a compound index for jobId and createdAt for efficient querying
chatSchema.index({ jobId: 1, createdAt: 1 });

export default mongoose.models.Chat || mongoose.model("Chat", chatSchema); 