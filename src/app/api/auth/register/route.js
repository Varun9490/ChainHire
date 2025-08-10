import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcrypt";

export async function POST(req) {
  try {
    await connectDB();
    const { name, email, password, userType } = await req.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return Response.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      userType,
    });

    return Response.json({ message: "User registered successfully" });
  } catch (err) {
    return Response.json({ error: "Registration failed" }, { status: 500 });
  }
}
