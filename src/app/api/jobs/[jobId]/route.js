import { connectDB } from "@/lib/dbConnect";
import Job from "@/models/Job";

export async function GET(req, { params }) {
  await connectDB();
  const { jobId } = await params;
  
  if (!jobId) {
    return Response.json({ error: "Job ID is required" }, { status: 400 });
  }

  try {
    const job = await Job.findById(jobId).lean();
    
    if (!job) {
      return Response.json({ error: "Job not found" }, { status: 404 });
    }
    
    return Response.json(job);
  } catch (error) {
    console.error("Error fetching job:", error);
    return Response.json({ error: "Failed to fetch job" }, { status: 500 });
  }
} 