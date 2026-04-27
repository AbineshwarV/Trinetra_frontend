import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { getMongoClientPromise } from "../../../lib/mongodb";
import { formatValidPhoneNumber } from "../../../lib/phone";

const SALT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;

interface SignupBody {
  email?: string;
  name?: string;
  company?: string;
  countryCode?: string;
  mobile?: string;
  password?: string;
  address?: string;
  agreeToTerms?: boolean;
}

function normalize(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SignupBody;

    const email = normalize(body.email).toLowerCase();
    const name = normalize(body.name);
    const company = normalize(body.company);
    const countryCode = normalize(body.countryCode);
    const mobile = normalize(body.mobile);
    const phoneNumber = formatValidPhoneNumber(countryCode, mobile);
    const password = typeof body.password === "string" ? body.password : "";
    const address = normalize(body.address);

    if (!email || !name || !company || !countryCode || !mobile || !password || !address) {
      return NextResponse.json({ message: "All fields are required." }, { status: 400 });
    }

    if (!body.agreeToTerms) {
      return NextResponse.json({ message: "You must accept Terms and Privacy Policy." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: "Please enter a valid email address." }, { status: 400 });
    }

    if (!phoneNumber) {
      return NextResponse.json({ message: "Please enter a valid phone number." }, { status: 400 });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` },
        { status: 400 }
      );
    }

    const client = await getMongoClientPromise();
    const db = client.db(process.env.MONGODB_DB_NAME || "trinetra");
    const usersCollection = db.collection("users");

    await usersCollection.createIndex({ email: 1 }, { unique: true });

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    await usersCollection.insertOne({
      email,
      name,
      company,
      mobile: phoneNumber,
      passwordHash,
      address,
      termsAcceptedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ message: "Registration successful." }, { status: 201 });
  } catch (error: unknown) {
    if (typeof error === "object" && error && "code" in error && error.code === 11000) {
      return NextResponse.json({ message: "Email is already registered." }, { status: 409 });
    }

    return NextResponse.json({ message: "Unable to register right now." }, { status: 500 });
  }
}
