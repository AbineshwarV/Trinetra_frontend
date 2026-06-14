import { NextResponse } from "next/server";

export const runtime = "nodejs";

type LatestVideo = {
  videoId: string;
  title: string;
  publishedDate: string | null;
  thumbnailUrl: string;
  youtubeUrl: string;
};

const CHANNEL_ID = "UC7apMBG0ZHBQWyFvLz35bVA";
const FEED_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const CACHE_TTL_MS = 60 * 60 * 1000;

let cachedPayload: { expiresAt: number; data: LatestVideo[] } | null = null;

function parsePublishedDate(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return trimmed;
  return date.toISOString().slice(0, 10);
}

function extractTag(content: string, tag: string) {
  const match = content.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i"));
  return match?.[1]?.trim() || "";
}

function parseFeed(xml: string): LatestVideo[] {
  const entries = xml.match(/<entry>[\s\S]*?<\/entry>/gi);
  if (!entries) return [];

  return entries
    .map((entry) => {
      const videoId = extractTag(entry, "yt:videoId");
      const title = extractTag(entry, "title");
      const publishedDate = parsePublishedDate(extractTag(entry, "published"));

      if (!videoId || !title) return null;

      return {
        videoId,
        title,
        publishedDate,
        thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
      } satisfies LatestVideo;
    })
    .filter((item): item is LatestVideo => item !== null)
    .slice(0, 4);
}

export async function GET() {
  const now = Date.now();
  if (cachedPayload && cachedPayload.expiresAt > now) {
    return NextResponse.json(cachedPayload.data, {
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=600",
      },
    });
  }

  try {
    const response = await fetch(FEED_URL, {
      headers: {
        Accept: "application/atom+xml,application/xml,text/xml;q=0.9,*/*;q=0.8",
        "User-Agent": "TrinetraLatestVideos/1.0",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Upstream returned ${response.status}` }, { status: 502 });
    }

    const xml = await response.text();
    const data = parseFeed(xml);
    cachedPayload = { expiresAt: now + CACHE_TTL_MS, data };

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load latest videos";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
