import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { token } = await req.json();

    if (!token) {
      return Response.json({ error: "Token missing" }, { status: 400 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return Response.json({ valid: true, user: decoded });
  } catch (error) {
    return Response.json(
      { valid: false, error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
