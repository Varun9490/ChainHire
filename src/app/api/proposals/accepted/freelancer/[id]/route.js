import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import Proposal from "@/models/Proposal";

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
    // Find accepted proposals for this freelancer
    const proposals = await Proposal.find({
      freelancerId: id,
      status: "accepted",
    })
      .populate("jobId")
      .exec();
    return NextResponse.json(proposals);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
