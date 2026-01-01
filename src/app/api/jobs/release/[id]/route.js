import { connectDB } from "@/lib/dbConnect";
import Job from "@/models/Job";

export async function POST(req, { params }) {
  await connectDB();
  const { id } = params;
  try {
    const job = await Job.findByIdAndUpdate(id, { escrowReleased: true }, { new: true });
    if (!job) return Response.json({ error: "Job not found" }, { status: 404 });
    return Response.json({ success: true, job });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to release escrow" }, { status: 500 });
  }
}
