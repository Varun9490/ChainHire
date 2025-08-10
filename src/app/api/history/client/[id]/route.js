import { connectDB } from "@/lib/dbConnect";
import Job from "@/models/Job";

export async function GET(req, context) {
  await connectDB();
  const { id } = await context.params;
  if (!id) return Response.json([], { status: 400 });
  try {
    // Find completed jobs for this client
    const jobs = await Job.find({ clientId: id, status: "completed" });
    return Response.json(jobs, { status: 200 });
  } catch (err) {
    return Response.json([], { status: 500 });
  }
}
