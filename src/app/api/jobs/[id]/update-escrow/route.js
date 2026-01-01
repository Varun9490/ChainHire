import { connectDB } from "@/lib/dbConnect";
import Job from "@/models/Job";
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
    
    // Get job and verify ownership
    const job = await Job.findById(id);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }
    
    if (job.clientId.toString() !== decoded.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    // Update escrow information
    const body = await req.json();
    const { escrowFunded, txSignature } = body;
    
    if (!job.escrow) {
      job.escrow = {
        funded: escrowFunded,
        txSignature,
        updatedAt: new Date()
      };
    } else {
      job.escrow.funded = escrowFunded;
      job.escrow.txSignature = txSignature;
      job.escrow.updatedAt = new Date();
    }
    
    await job.save();
    
    return NextResponse.json({ 
      message: "Escrow information updated", 
      job 
    });
  } catch (error) {
    console.error("Update escrow error:", error);
    return NextResponse.json(
      { error: "Failed to update escrow information" }, 
      { status: 500 }
    );
  }
}