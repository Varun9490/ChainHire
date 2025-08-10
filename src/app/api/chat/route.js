import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Message from "@/models/Message";

export async function GET(request, { params }) {
  try {
    await connectToDatabase();
    const jobId = params?.jobId || request.nextUrl.searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    const messages = await Message.find({ jobId })
      .sort({ timestamp: 1 })
      .populate("sender", "name")
      .lean();

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    await connectToDatabase();
    // Accept jobId from params, query, or body for flexibility
    let jobId = params?.jobId || request.nextUrl?.searchParams?.get("jobId");
    const body = await request.json();
    jobId = jobId || body.jobId;
    const senderId = body.senderId;
    const messageType = body.messageType || "text";
    // For text/emoji, allow 'message' or 'content' as the field
    let content = body.content;
    if (!content && typeof body.message === "string") {
      content = body.message;
    }

    // Validate required fields
    if (!jobId || !senderId || !content) {
      return NextResponse.json(
        { error: "Job ID, sender ID, and content are required" },
        { status: 400 }
      );
    }

    // Build metadata for audio/image
    let metadata = {};
    if (messageType === "audio" && body.metadata?.duration) {
      metadata.duration = body.metadata.duration;
    }
    if (messageType === "image" && body.metadata?.dimensions) {
      metadata.dimensions = body.metadata.dimensions;
    }

    const newMessage = await Message.create({
      jobId,
      messageType,
      content,
      sender: senderId,
      timestamp: new Date(),
      metadata,
    });

    await newMessage.populate("sender", "name");
    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
