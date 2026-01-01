import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        enum: ["bid_accepted", "bid_rejected", "new_bid", "escrow_funded", "funds_released", "job_completed", "general"],
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    relatedJob: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
    },
    relatedProposal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Proposal",
    },
    read: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for efficient queries
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export default mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);
