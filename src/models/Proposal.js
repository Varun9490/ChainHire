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
  },
  { timestamps: true }
);

export default mongoose.models.Proposal ||
  mongoose.model("Proposal", ProposalSchema);
