import { connectDB } from "@/lib/dbConnect";
import Job from "@/models/Job";

export async function DELETE(req, { params }) {
  await connectDB();
  try {
    await Job.findByIdAndDelete(params.id);
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: "Failed to delete job" }, { status: 500 });
  }
}
