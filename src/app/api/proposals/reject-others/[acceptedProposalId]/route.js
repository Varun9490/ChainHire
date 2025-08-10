import { connectDB } from "@/lib/dbConnect";
import Proposal from "@/models/Proposal";

export async function PUT(req, { params }) {
  await connectDB();
  const { acceptedProposalId } = await params;
  if (!acceptedProposalId)
    return Response.json({ error: "Missing proposal id" }, { status: 400 });
  try {
    // Find the accepted proposal to get jobId
    const accepted = await Proposal.findById(acceptedProposalId);
    if (!accepted)
      return Response.json({ error: "Proposal not found" }, { status: 404 });
    // Reject all other proposals for this job
    await Proposal.updateMany(
      { jobId: accepted.jobId, _id: { $ne: acceptedProposalId } },
      { status: "rejected" }
    );
    return Response.json({ success: true }, { status: 200 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
