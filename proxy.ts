import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookieName, verifySessionToken } from "./lib/session";

export default async function proxy(request: NextRequest) {
  const sessionCookie = request.cookies.get(getSessionCookieName())?.value;
  const isAuthenticated = await verifySessionToken(sessionCookie);

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/analyzer") && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if ((pathname === "/login" || pathname === "/signup") && isAuthenticated) {
    return NextResponse.redirect(new URL("/analyzer", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/analyzer/:path*", "/login", "/signup"],
};