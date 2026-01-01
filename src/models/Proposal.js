import mongoose from "mongoose";

const ProposalSchema = new mongoose.Schema(
  {
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coverLetter: { type: String, required: true },
    proposedAmount: { type: Number, required: true },
    isAccepted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    escrow: {
      funded: { type: Boolean, default: false },
      amount: { type: Number },
      currency: { type: String },
      solAmount: { type: Number },
      txSignature: { type: String },
      updatedAt: { type: Date }
    }
  },
  { timestamps: true }
);

export default mongoose.models.Proposal ||
  mongoose.model("Proposal", ProposalSchema);
