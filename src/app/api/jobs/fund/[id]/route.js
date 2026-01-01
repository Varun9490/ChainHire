import { connectDB } from "@/lib/dbConnect";
import Job from "@/models/Job";

export async function POST(req, { params }) {
  await connectDB();
  const { id } = params;
  const { escrowPubkey, signature, amountSol } = await req.json();

  try {
    const job = await Job.findByIdAndUpdate(
      id,
      {
        escrowPubkey,
        escrowFunded: true,
        escrowSignature: signature,
        escrowAmountSol: amountSol,
        escrowFundedAt: new Date(),
      },
      { new: true }
    );

    if (!job) return Response.json({ error: "Job not found" }, { status: 404 });

    return Response.json({ success: true, job, message: `Escrow funded with ${amountSol} SOL` });
  } catch (err) {
    console.error("Error funding escrow:", err);
    return Response.json({ error: "Failed to fund escrow" }, { status: 500 });
  }
}
