import { connectDB } from "@/lib/dbConnect";
import Proposal from "@/models/Proposal";
import Job from "@/models/Job";
import { createNotification, createBulkNotifications } from "@/utils/notifications";

export async function PATCH(req, { params }) {
  await connectDB();
  const { id } = await params;

  try {
    // Find the proposal being accepted
    const acceptedProposal = await Proposal.findById(id).populate("freelancerId", "name email");
    if (!acceptedProposal) {
      return Response.json({ error: "Proposal not found" }, { status: 404 });
    }

    // Get the job details
    const job = await Job.findById(acceptedProposal.jobId).populate("clientId", "name");
    if (!job) {
      return Response.json({ error: "Job not found" }, { status: 404 });
    }

    // Get all other proposals for this job
    const allProposals = await Proposal.find({
      jobId: acceptedProposal.jobId,
      _id: { $ne: id }
    }).populate("freelancerId", "name");

    // Mark all other proposals as not accepted
    await Proposal.updateMany(
      { jobId: acceptedProposal.jobId, _id: { $ne: id } },
      { isAccepted: false, status: "rejected" }
    );

    // Mark the accepted proposal
    acceptedProposal.isAccepted = true;
    acceptedProposal.status = "accepted";
    await acceptedProposal.save();

    // Update the job with accepted proposal and set freelancer
    await Job.findByIdAndUpdate(acceptedProposal.jobId, {
      acceptedProposal: acceptedProposal._id,
      freelancerId: acceptedProposal.freelancerId._id,
      status: "in-progress",
    });

    // Create notification for accepted freelancer
    await createNotification({
      userId: acceptedProposal.freelancerId._id,
      type: "bid_accepted",
      title: "🎉 Your Bid Was Accepted!",
      message: `Congratulations! Your bid for "${job.title}" has been accepted by ${job.clientId.name}. The client will fund the escrow soon.`,
      relatedJob: job._id,
      relatedProposal: acceptedProposal._id,
    });

    // Create notifications for rejected freelancers
    const rejectedNotifications = allProposals.map(proposal => ({
      userId: proposal.freelancerId._id,
      type: "bid_rejected",
      title: "Bid Update",
      message: `Your bid for "${job.title}" was not selected. Keep trying, and you'll land the perfect gig!`,
      relatedJob: job._id,
      relatedProposal: proposal._id,
    }));

    if (rejectedNotifications.length > 0) {
      await createBulkNotifications(rejectedNotifications);
    }

    // Return response with escrow payment instructions
    return Response.json({
      message: "Proposal accepted successfully",
      proposal: acceptedProposal,
      requiresEscrowPayment: true,
      escrowDetails: {
        amount: acceptedProposal.proposedAmount || job.budget,
        freelancerId: acceptedProposal.freelancerId._id,
        jobId: job._id,
      },
      notificationsSent: {
        accepted: 1,
        rejected: rejectedNotifications.length,
      },
    });
  } catch (err) {
    console.error("Error accepting proposal:", err);
    return Response.json(
      { error: "Failed to accept proposal", details: err.message },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  // Same logic as PATCH for compatibility
  return PATCH(req, { params });
}

export async function POST(req, { params }) {
  // Also support POST for flexibility
  return PATCH(req, { params });
}
