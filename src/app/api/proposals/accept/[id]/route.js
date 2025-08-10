import { connectDB } from "@/lib/dbConnect";
import Proposal from "@/models/Proposal";
import Job from "@/models/Job";

export async function PATCH(req, { params }) {
  await connectDB();
  const { id } = await params;

  try {
    // Mark all other proposals for this job as not accepted
    const current = await Proposal.findById(id);
    if (!current) {
      return Response.json({ error: "Proposal not found" }, { status: 404 });
    }

    await Proposal.updateMany({ jobId: current.jobId }, { isAccepted: false });
    current.isAccepted = true;
    await current.save();
    // Persist accepted proposal in job
    await Job.findByIdAndUpdate(current.jobId, {
      acceptedProposal: current._id,
    });

    return Response.json({ message: "Proposal accepted", proposal: current });
  } catch (err) {
    return Response.json(
      { error: "Failed to accept proposal" },
      { status: 500 }
    );
  }
}

export async function PUT(req, { params }) {
  // Same logic as PATCH for compatibility
  return PATCH(req, { params });
}
