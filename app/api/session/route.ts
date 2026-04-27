import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getMongoClientPromise } from "../../../lib/mongodb";
import { getSessionCookieName, getSessionUserIdFromToken } from "../../../lib/session";

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get(getSessionCookieName())?.value;
  const userId = await getSessionUserIdFromToken(sessionCookie);

  if (!userId || !ObjectId.isValid(userId)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const client = await getMongoClientPromise();
  const db = client.db(process.env.MONGODB_DB_NAME || "trinetra");
  const usersCollection = db.collection("users");

  const user = await usersCollection.findOne<{ email?: string; name?: string }>({ _id: new ObjectId(userId) });

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(
    {
      user: {
        email: user.email || "",
        name: user.name || "",
      },
    },
    { status: 200 }
  );
}
