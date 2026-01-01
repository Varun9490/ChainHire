import { connectDB } from "@/lib/dbConnect";
import Job from "@/models/Job";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectDB();
  try {
    // Use req.headers.get for Next.js API routes
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "No token" }, { status: 401 });
    }
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    const body = await req.json();
    const { title, description, budget } = body;
    if (!title || !description || !budget) {
      return NextResponse.json(
        { error: "All fields required" },
        { status: 400 }
      );
    }
    const jobData = { ...body };
    if (!jobData.skills || jobData.skills.length === 0) {
      delete jobData.skills;
    }
    
    // Add escrow information if provided
    if (jobData.fundEscrow) {
      jobData.escrow = {
        funded: false, // Will be updated after blockchain confirmation
        amount: jobData.budget,
        currency: "INR",
        solAmount: jobData.budget / 6000, // Example conversion rate
      };
    }
    
    // Remove the fundEscrow flag as it's not needed in the database
    delete jobData.fundEscrow;
    
    const job = await Job.create({
      ...jobData,
      clientId: decoded.userId,
    });
    return NextResponse.json({ message: "Job created", job });
  } catch (error) {
    console.error("Job creation error:", error);
    return NextResponse.json({ error: "Job creation failed" }, { status: 500 });
  }
}
