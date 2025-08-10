import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Proposal from "@/models/Proposal";
import Job from "@/models/Job";

export async function GET(req, context) {
  await connectDB();
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json(
      { error: "Missing freelancer id" },
      { status: 400 }
    );
  }
  try {
    // Find all proposals by this freelancer and populate job details
    const proposals = await Proposal.find({ freelancerId: id })
      .populate("jobId")
      .exec();
    return NextResponse.json(proposals);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
