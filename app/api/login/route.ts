import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getMongoClientPromise } from "../../../lib/mongodb";
import { createSessionToken, getSessionCookieName, getSessionTtlSeconds } from "../../../lib/session";

interface LoginBody {
  email?: string;
  password?: string;
}

function normalize(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    const body = (await request.json()) as LoginBody;

    const email = normalize(body.email).toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: "Please enter a valid email address." }, { status: 400 });
    }

    const client = await getMongoClientPromise();
    const db = client.db(process.env.MONGODB_DB_NAME || "trinetra");
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne<{ _id: { toString(): string }; passwordHash?: string; name?: string }>({ email });

    if (!user?.passwordHash) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    const sessionToken = await createSessionToken(user._id.toString());

    const response = NextResponse.json(
      {
        message: "Login successful.",
        user: {
          email,
          name: user.name || "",
        },
      },
      { status: 200 }
    );

    response.cookies.set({
      name: getSessionCookieName(),
      value: sessionToken,
      httpOnly: true,
      sameSite: isProduction ? "strict" : "lax",
      secure: isProduction,
      maxAge: getSessionTtlSeconds(),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("[api/login] Login failed", error);

    return NextResponse.json({ message: "Unable to login right now." }, { status: 500 });
  }
}
