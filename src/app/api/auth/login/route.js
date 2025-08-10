import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    const user = await User.findOne({ email });
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return Response.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign(
      {
        _id: user._id,
        userId: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return Response.json({
      token,
      user: { name: user.name, email: user.email, userType: user.userType },
    });
  } catch (err) {
    return Response.json({ error: "Login failed" }, { status: 500 });
  }
}
