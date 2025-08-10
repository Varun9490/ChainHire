import { connectDB } from "@/lib/dbConnect";
import Job from "@/models/Job";
import Proposal from "@/models/Proposal";

export async function PUT(req, { params }) {
  await connectDB();
  const { jobId } = await params;
  
  if (!jobId) {
    return Response.json({ error: "Job ID is required" }, { status: 400 });
  }

  try {
    // Find the job and its accepted proposal
    const job = await Job.findById(jobId);
    if (!job) {
      return Response.json({ error: "Job not found" }, { status: 404 });
    }

    const acceptedProposal = await Proposal.findOne({
      jobId: job._id,
      status: "completed"
    });

    if (!acceptedProposal) {
      return Response.json({ error: "No completed proposal found" }, { status: 404 });
    }

    // Mark the job as completed and verified
    await Job.findByIdAndUpdate(job._id, { 
      status: "completed",
      completionVerified: true,
      completedAt: new Date()
    });

    // Update the proposal status
    await Proposal.findByIdAndUpdate(acceptedProposal._id, {
      completionVerified: true,
      verifiedAt: new Date()
    });

    return Response.json({ success: true, message: "Project completion verified" });
  } catch (error) {
    console.error("Error verifying project completion:", error);
    return Response.json({ error: "Failed to verify project completion" }, { status: 500 });
  }
} 