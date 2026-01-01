import { connectDB } from "@/lib/dbConnect";
import Proposal from "@/models/Proposal";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req) {
  await connectDB();
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { jobId, coverLetter, proposedAmount, fundEscrow } = await req.json();

    // Create proposal data
    const proposalData = {
      jobId,
      freelancerId: decoded.userId,
      coverLetter,
      proposedAmount,
    };

    // Add escrow information if provided
    if (fundEscrow) {
      proposalData.escrow = {
        funded: false, // Will be updated after actual funding
        amount: proposedAmount,
        currency: "INR",
        solAmount: (proposedAmount / 6000).toFixed(6), // INR to SOL conversion
      };
    }

    const newProposal = await Proposal.create(proposalData);

    return NextResponse.json({
      message: "Proposal submitted",
      proposal: newProposal,
    });
  } catch (err) {
    console.error("Proposal submission error:", err);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
