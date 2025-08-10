import { connectDB } from "@/lib/dbConnect";
import Proposal from "@/models/Proposal";
import User from "@/models/User";

export async function GET(req, { params }) {
  await connectDB();
  const { id } = await params;
  const jobId = id;

  try {
    const proposals = await Proposal.find({ jobId })
      .populate("freelancerId", "name email")
      .sort({ createdAt: -1 });

    return Response.json(proposals);
  } catch (err) {
    return Response.json(
      { error: "Failed to fetch proposals" },
      { status: 500 }
    );
  }
}
