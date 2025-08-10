import { connectDB } from "@/lib/dbConnect";
import Job from "@/models/Job";

export async function PUT(req, { params }) {
  await connectDB();
  const body = await req.json();

  try {
    const { id } = await params;
    const updated = await Job.findByIdAndUpdate(id, body, { new: true });
    return Response.json(updated);
  } catch (err) {
    return Response.json({ error: "Failed to update job" }, { status: 500 });
  }
}
