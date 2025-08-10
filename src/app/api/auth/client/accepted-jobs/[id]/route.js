import { connectDB } from "@/lib/dbConnect";
import Job from "@/models/Job";
import Proposal from "@/models/Proposal";
import User from "@/models/User";

export async function GET(req, { params }) {
  await connectDB();
  const { id } = await params;
  const clientId = id;

  try {
    // Get jobs posted by this client
    const jobs = await Job.find({ clientId });

    // For each job, find accepted proposal
    const results = await Promise.all(
      jobs.map(async (job) => {
        const acceptedProposal = await Proposal.findOne({
          jobId: job._id,
          isAccepted: true,
        }).populate("freelancerId", "name email");

        return {
          job,
          acceptedProposal,
        };
      })
    );

    return Response.json(results);
  } catch (err) {
    return Response.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
