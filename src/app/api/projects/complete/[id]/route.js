import { connectDB } from "@/lib/dbConnect";
import Job from "@/models/Job";

export async function PUT(req, { params }) {
  await connectDB();
  const { id } = params;
  if (!id) return Response.json({ error: "Missing job id" }, { status: 400 });
  try {
    await Job.findOneAndUpdate({ _id: id }, { status: "completed" });
    return Response.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
