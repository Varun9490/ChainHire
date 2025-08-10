import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Job from "@/models/Job";

export async function GET() {
  await connectDB();
  try {
    // Return all jobs, sorted by most recent
    const jobs = await Job.find({}).sort({ createdAt: -1 }).exec();
    return NextResponse.json(jobs);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
