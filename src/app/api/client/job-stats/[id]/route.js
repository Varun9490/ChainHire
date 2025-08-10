import { connectDB } from "@/lib/dbConnect";
import Job from "@/models/Job";
import Proposal from "@/models/Proposal";
import User from "@/models/User";

export async function GET(req, context) {
  await connectDB();
  const { id } = await context.params;
  const clientId = id;

  try {
    const jobs = await Job.find({ clientId });

    const jobStats = await Promise.all(
      jobs.map(async (job) => {
        const proposals = await Proposal.find({ jobId: job._id }).populate(
          "freelancerId",
          "name email"
        );
        const accepted = proposals.find((p) => p.isAccepted);

        return {
          job,
          totalProposals: proposals.length,
          acceptedProposal: accepted || null,
          paymentStatus: accepted?.isPaid
            ? "Paid"
            : accepted
            ? "Escrowed"
            : "Pending",
        };
      })
    );

    return Response.json(jobStats);
  } catch (err) {
    return Response.json({ error: "Stats fetch failed" }, { status: 500 });
  }
}
