import { connectDB } from "@/lib/dbConnect";
import Chat from "@/models/Chat";

export async function GET(req, { params }) {
  await connectDB();
  const { jobId } = await params;
  
  if (!jobId) {
    return Response.json({ error: "Job ID is required" }, { status: 400 });
  }

  try {
    const messages = await Chat.find({ jobId })
      .sort({ createdAt: 1 })
      .lean();
    
    return Response.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return Response.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  await connectDB();
  const { jobId } = await params;
  
  if (!jobId) {
    return Response.json({ error: "Job ID is required" }, { status: 400 });
  }

  try {
    const { content, senderId, senderName } = await req.json();
    
    if (!content || !senderId || !senderName) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const message = new Chat({
      jobId,
      senderId,
      senderName,
      content,
    });

    await message.save();
    
    return Response.json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    return Response.json({ error: "Failed to send message" }, { status: 500 });
  }
} 