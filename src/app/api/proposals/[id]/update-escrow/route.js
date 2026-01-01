import { connectDB } from "@/lib/dbConnect";
import Proposal from "@/models/Proposal";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  await connectDB();
  try {
    const { id } = params;
    
    // Authenticate user
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
    
    // Get proposal and verify ownership
    const proposal = await Proposal.findById(id);
    if (!proposal) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }
    
    if (proposal.freelancerId.toString() !== decoded.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    // Update escrow information
    const body = await req.json();
    const { escrowFunded, txSignature } = body;
    
    if (!proposal.escrow) {
      proposal.escrow = {
        funded: escrowFunded,
        txSignature,
        updatedAt: new Date()
      };
    } else {
      proposal.escrow.funded = escrowFunded;
      proposal.escrow.txSignature = txSignature;
      proposal.escrow.updatedAt = new Date();
    }
    
    await proposal.save();
    
    return NextResponse.json({ 
      message: "Escrow information updated", 
      proposal 
    });
  } catch (error) {
    console.error("Update escrow error:", error);
    return NextResponse.json(
      { error: "Failed to update escrow information" }, 
      { status: 500 }
    );
  }
}