import { connectDB } from "@/lib/dbConnect";
import Job from "@/models/Job";

export async function PUT(req, { params }) {
  await connectDB();
  const { jobId } = await params;
  if (!jobId)
    return Response.json({ error: "Missing job id" }, { status: 400 });
  try {
    await Job.findOneAndUpdate({ _id: jobId }, { status: "completed" });
    return Response.json({ success: true }, { status: 200 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
