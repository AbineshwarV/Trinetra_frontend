import { NextResponse } from "next/server";

const TRINETRA_USECASE_2_BASE_URL =
  process.env.TRINETRA_USECASE_2_BASE_URL ||
  process.env.NEXT_PUBLIC_TRINETRA_USECASE_2_BASE_URL ||
  "http://127.0.0.1:8080";

function buildTrinetraUrl(endpoint: string) {
  const base = TRINETRA_USECASE_2_BASE_URL.endsWith("/")
    ? TRINETRA_USECASE_2_BASE_URL.slice(0, -1)
    : TRINETRA_USECASE_2_BASE_URL;
  return `${base}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
}

export async function GET() {
  const upstream = await fetch(buildTrinetraUrl("/api/interactive-intelligence-analytics"), {
    cache: "no-store",
  });

  if (!upstream.ok) {
    return NextResponse.json({ error: `Upstream returned ${upstream.status}` }, { status: upstream.status });
  }

  const data = await upstream.json();
  return NextResponse.json(data, { status: upstream.status });
}
