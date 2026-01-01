import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    console.log("Starting user registration...");
    await connectDB();
    console.log("Database connected successfully");

    const { name, email, password, userType } = await req.json();
    console.log("Registering user:", { name, email, userType });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists:", email);
      return Response.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      userType,
    });

    console.log("User registered successfully:", user._id);
    return Response.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err.message);
    console.error("Full error:", err);
    return Response.json({
      error: "Registration failed",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 });
  }
}

