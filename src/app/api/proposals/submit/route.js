import { connectDB } from "@/lib/dbConnect";
import Proposal from "@/models/Proposal";
import jwt from "jsonwebtoken";

export async function POST(req) {
  await connectDB();
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { jobId, coverLetter, proposedAmount } = await req.json();

    const newProposal = await Proposal.create({
      jobId,
      freelancerId: decoded.userId,
      coverLetter,
      proposedAmount,
    });

    return Response.json({
      message: "Proposal submitted",
      proposal: newProposal,
    });
  } catch (err) {
    return Response.json({ error: "Submission failed" }, { status: 500 });
  }
}
