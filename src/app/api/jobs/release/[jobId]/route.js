import { connectDB } from "@/lib/dbConnect";
import Job from "@/models/Job";

export async function POST(req, { params }) {
  await connectDB();
  const { jobId } = await params;
  try {
    const job = await Job.findByIdAndUpdate(
      jobId,
      { escrowReleased: true },
      { new: true }
    );
    if (!job) {
      return Response.json({ error: "Job not found" }, { status: 404 });
    }
    return Response.json({ success: true, job });
  } catch (err) {
    return Response.json(
      { error: "Failed to release escrow" },
      { status: 500 }
    );
  }
}
