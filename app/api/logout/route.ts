import { NextResponse } from "next/server";
import { getSessionCookieName } from "../../../lib/session";

export async function POST(request: Request) {
  const isProduction = process.env.NODE_ENV === "production";
  const response = NextResponse.redirect(new URL("/login", request.url));

  response.cookies.set({
    name: getSessionCookieName(),
    value: "",
    httpOnly: true,
    sameSite: isProduction ? "strict" : "lax",
    secure: isProduction,
    maxAge: 0,
    path: "/",
  });

  return response;
}