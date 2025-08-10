import { connectDB } from "@/lib/dbConnect";
import Proposal from "@/models/Proposal";
import Job from "@/models/Job";

export async function PUT(req, { params }) {
  await connectDB();
  const { proposalId } = await params;
  if (!proposalId)
    return Response.json({ error: "Missing proposal id" }, { status: 400 });
  try {
    // Update the proposal status to completed
    await Proposal.findOneAndUpdate(
      { _id: proposalId },
      { 
        status: "completed",
        completedAt: new Date(),
        completionRequested: true
      }
    );

    // Also update the job status to indicate completion requested
    const proposal = await Proposal.findById(proposalId);
    if (proposal) {
      await Job.findByIdAndUpdate(proposal.jobId, {
        completionRequested: true,
        completionRequestedAt: new Date()
      });
    }

    return Response.json({ success: true, message: "Project marked as completed" }, { status: 200 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
