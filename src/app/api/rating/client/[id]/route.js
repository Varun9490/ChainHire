import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";

export async function GET(req, context) {
  await connectDB();
  const { id } = await context.params;
  if (!id) return Response.json({ rating: null }, { status: 400 });
  try {
    // Find client and return their rating
    const user = await User.findById(id);
    return Response.json({ rating: user?.rating ?? null }, { status: 200 });
  } catch (err) {
    return Response.json({ rating: null }, { status: 500 });
  }
}
