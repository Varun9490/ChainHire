import { connectDB } from "@/lib/dbConnect";
import Chat from "@/models/Chat";

export async function GET(req, { params }) {
  await connectDB();
  const { id } = params;

  if (!id) {
    return Response.json({ error: "Job ID is required" }, { status: 400 });
  }

  try {
    const messages = await Chat.find({ jobId: id }).sort({ createdAt: 1 }).lean();
    return Response.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return Response.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  await connectDB();
  const { id } = params;

  if (!id) {
    return Response.json({ error: "Job ID is required" }, { status: 400 });
  }

  try {
    const { content, senderId, senderName, language } = await req.json();

    if (!content || !senderId || !senderName) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const message = new Chat({
      jobId: id,
      senderId,
      senderName,
      content,
      language,
    });

    await message.save();

    return Response.json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    return Response.json({ error: "Failed to send message" }, { status: 500 });
  }
}
