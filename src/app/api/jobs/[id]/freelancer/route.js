import { connectDB } from "@/lib/dbConnect";
import Job from "@/models/Job";

export async function GET(req, { params }) {
  await connectDB();
  const { id } = params;

  try {
    const job = await Job.findById(id).populate("freelancerId");
    if (!job) return Response.json({ error: "Job not found" }, { status: 404 });
    if (!job.freelancerId)
      return Response.json({ error: "No freelancer assigned to this job" }, { status: 404 });

    return Response.json({
      walletAddress: job.freelancerId.walletAddress,
      freelancerId: job.freelancerId._id,
    });
  } catch (err) {
    console.error("Error fetching freelancer data:", err);
    return Response.json({ error: "Failed to fetch freelancer data" }, { status: 500 });
  }
}
