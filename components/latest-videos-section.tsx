"use client";

import { useEffect, useState } from "react";
import { FiArrowUpRight, FiCalendar, FiPlay, FiYoutube } from "react-icons/fi";
import { apiFetch } from "../lib/api";

type LatestVideo = {
  videoId: string;
  title: string;
  publishedDate: string | null;
  thumbnailUrl: string;
  youtubeUrl: string;
};

function formatPublishedDate(value: string | null) {
  if (!value) return "Published date unavailable";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function VideoSkeleton() {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/6 bg-[#0b1020]">
      <div className="aspect-video animate-pulse bg-white/5" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-5/6 animate-pulse rounded-full bg-white/10" />
        <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/10" />
      </div>
    </article>
  );
}

export default function LatestVideosSection() {
  const [videos, setVideos] = useState<LatestVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadVideos() {
      try {
        setLoading(true);
        setError(null);
        const response = await apiFetch("/api/latest-videos", { cache: "no-store" });
        if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
        const data = (await response.json()) as LatestVideo[];
        if (!active) return;
        setVideos(Array.isArray(data) ? data.slice(0, 4) : []);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Unable to load videos.");
        setVideos([]);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadVideos();
    return () => {
      active = false;
    };
  }, []);
  return (
    <section className="border-t border-white/6 bg-[#050814] px-5 py-14 md:px-8">
      <div className="mx-auto max-w-7xl rounded-[30px] border border-white/6 bg-[#070b17] p-6 md:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-violet-300">02</p>
            <h2 className="mt-2 text-2xl font-bold md:text-3xl">Latest from Trinetra News</h2>
            <p className="mt-2 text-sm text-white/60">Insights, reports, and analysis from our YouTube channel.</p>
          </div>
          <a
            href="https://www.youtube.com/channel/UC7apMBG0ZHBQWyFvLz35bVA"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-violet-500/10 px-5 py-2 text-sm font-medium text-violet-200 transition hover:bg-violet-500/20"
          >
            <FiYoutube />
            Visit Channel
            <FiArrowUpRight />
          </a>
        </div>

        {loading ? (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <VideoSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-white/6 bg-[#0b1020] px-5 py-6 text-sm text-white/65">
            We could not load the latest videos right now. Please try again later.
          </div>
        ) : videos.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-white/6 bg-[#0b1020] px-5 py-6 text-sm text-white/65">
            No videos are available at the moment.
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {videos.map((video) => (
              <a
                key={video.videoId}
                href={video.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group overflow-hidden rounded-2xl border border-white/6 bg-[#0b1020] transition duration-300 hover:-translate-y-1 hover:border-violet-400/25 hover:shadow-[0_24px_50px_rgba(0,0,0,0.35)]"
              >
                <div className="relative aspect-video overflow-hidden bg-[#101728]">
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent opacity-80 transition group-hover:opacity-100" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="grid h-14 w-14 place-items-center rounded-full border border-white/15 bg-black/35 text-2xl text-white shadow-[0_0_24px_rgba(0,0,0,0.28)] transition duration-300 group-hover:scale-110">
                      <FiPlay className="translate-x-px" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 text-sm font-semibold leading-6 text-white">{video.title}</h3>
                  <div className="mt-3 flex items-center gap-2 text-xs text-white/55">
                    <FiCalendar />
                    <span>{formatPublishedDate(video.publishedDate)}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
