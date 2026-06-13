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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const target = url.searchParams.get("url");

  if (!target) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  const resolved = target.startsWith("http://") || target.startsWith("https://")
    ? target
    : buildTrinetraUrl(target);

  const upstream = await fetch(resolved, { cache: "no-store" });
  if (!upstream.ok) {
    return NextResponse.json({ error: `Upstream returned ${upstream.status}` }, { status: upstream.status });
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: {
      "content-type": upstream.headers.get("content-type") || "application/octet-stream",
      "cache-control": "no-store",
    },
  });
}
