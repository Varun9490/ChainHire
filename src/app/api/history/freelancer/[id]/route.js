import { connectDB } from "@/lib/dbConnect";
import Proposal from "@/models/Proposal";
import Job from "@/models/Job";

export async function GET(req, { params }) {
  await connectDB();
  const { id } = await params;
  if (!id) return Response.json([], { status: 400 });
  try {
    // Find completed proposals for this freelancer
    const completedProposals = await Proposal.find({ 
      freelancerId: id, 
      status: "completed" 
    }).populate("jobId");
    
    return Response.json(completedProposals, { status: 200 });
  } catch (err) {
    return Response.json([], { status: 500 });
  }
} 