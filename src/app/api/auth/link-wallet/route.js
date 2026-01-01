import { NextResponse } from "next/server";
import connectDB from "@/lib/dbConnect";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(request) {
  try {
    await connectDB();
    
    // Get authorization header
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Verify token
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get request body
    const { userId, walletAddress } = await request.json();
    
    // Validate request
    if (!userId || !walletAddress) {
      return NextResponse.json({ error: "User ID and wallet address are required" }, { status: 400 });
    }
    
    // Ensure user can only update their own account
    if (decoded.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized to update this account" }, { status: 403 });
    }
    
    // Update user with wallet address
    const user = await User.findByIdAndUpdate(
      userId,
      { walletAddress },
      { new: true }
    );
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json({ 
      message: "Wallet linked successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        walletAddress: user.walletAddress
      }
    });
    
  } catch (error) {
    console.error("Error linking wallet:", error);
    
    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    
    return NextResponse.json({ error: "Failed to link wallet" }, { status: 500 });
  }
}