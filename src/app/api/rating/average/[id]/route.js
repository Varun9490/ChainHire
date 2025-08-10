import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET(req, { params }) {
  await connectDB();
  const { id } = await params;
  if (!id) return Response.json({ avg: null }, { status: 400 });
  try {
    // Find user and return their rating
    const user = await User.findById(id);
    const avg = user?.rating || 0;
    return Response.json({ avg }, { status: 200 });
  } catch (err) {
    return Response.json({ avg: 0 }, { status: 500 });
  }
} 