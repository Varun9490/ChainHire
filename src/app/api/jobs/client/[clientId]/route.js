import { connectDB } from "@/lib/dbConnect";
import Job from "@/models/Job";
import Proposal from "@/models/Proposal";
import User from "@/models/User";

export async function GET(req, context) {
  await connectDB();
  const { clientId } = await context.params;

  // 1) Get all jobs posted by this client
  const jobs = await Job.find({ clientId }).lean();

  // 2) For each job, fetch all proposals and the accepted proposal
  const withProposals = await Promise.all(
    jobs.map(async (job) => {
      const proposals = await Proposal.find({ jobId: job._id })
        .populate("freelancerId", "name email")
        .lean();
      
      // Find the accepted proposal
      const acceptedProposal = proposals.find(p => p.isAccepted) || null;
      
      return { job, proposals, acceptedProposal };
    })
  );

  return new Response(JSON.stringify(withProposals), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
