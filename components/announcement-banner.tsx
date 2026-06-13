"use client";

import { useState } from "react";

type Props = {
  message?: string;
  variant?: "default" | "pulse";
};

export default function AnnouncementBanner({
  message = "🎉 New update: faster analysis, cleaner reports, and improved accuracy across video, audio, and text.",
  variant = "default",
}: Props) {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const isPulse = variant === "pulse";
  const emoji = message.startsWith("🎉") ? "🎉" : null;
  const messageText = emoji ? message.replace(/^🎉\s*/, "") : message;

  return (
    <div
      className={`relative z-20 w-full border-b ${
        isPulse
          ? "border-violet-400/35 bg-linear-to-r from-[#2a144a] via-[#3b1b78] to-[#0b1020] text-white"
          : "border-[#ffd230]/35 bg-linear-to-r from-[#fff3b0] via-[#ffd230] to-[#ffb703] text-[#071127]"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-5 py-1 md:px-8">
        <p className="truncate text-center text-[11px] font-bold tracking-wide md:text-xs">
          {emoji ? <span className="mr-1 text-base md:text-lg">{emoji}</span> : null}
          {messageText}
        </p>

        <button
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Close announcement"
          className={`absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 cursor-pointer place-items-center rounded-md transition md:right-6 ${
            isPulse ? "bg-white/10 text-white hover:bg-white/15" : "bg-black/10 text-[#071127] hover:bg-black/15"
          }`}
        >
          ×
        </button>
      </div>
    </div>
  );
}
