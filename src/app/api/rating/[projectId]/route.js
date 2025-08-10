import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST(req, { params }) {
  await connectDB();
  const { projectId } = await params;
  try {
    const { targetUserId, rating, comment } = await req.json();
    
    if (!targetUserId || !rating) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Update user rating (this is a simplified implementation)
    // In a real app, you might want to store ratings separately and calculate averages
    const user = await User.findById(targetUserId);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // For now, just update the user's rating field
    // In a production app, you'd want to store individual ratings and calculate averages
    user.rating = rating;
    await user.save();

    return Response.json({ success: true }, { status: 200 });
  } catch (err) {
    return Response.json({ error: "Failed to submit rating" }, { status: 500 });
  }
} 