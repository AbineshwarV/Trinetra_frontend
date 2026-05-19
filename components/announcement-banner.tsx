"use client";

import { useState } from "react";

type Props = {
  message?: string;
};

export default function AnnouncementBanner({
  message = "🎉 New update: faster analysis, cleaner reports, and improved accuracy across video, audio, and text.",
}: Props) {
  // Show on every refresh; closing only hides for the current render.
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const emoji = message.startsWith("🎉") ? "🎉" : null;
  const messageText = emoji ? message.replace(/^🎉\s*/, "") : message;

  return (
    <div className="relative z-20 w-full border-b border-[#ffd230]/35 bg-linear-to-r from-[#fff3b0] via-[#ffd230] to-[#ffb703] text-[#071127]">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-5 py-1 md:px-8">
        <p className="truncate text-center text-[11px] font-bold tracking-wide md:text-xs">
          {emoji ? <span className="mr-1 text-base md:text-lg">{emoji}</span> : null}
          {messageText}
        </p>

        <button
          type="button"
          onClick={() => {
            setVisible(false);
          }}
          aria-label="Close announcement"
          className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 cursor-pointer place-items-center rounded-md bg-black/10 text-[#071127] transition hover:bg-black/15 md:right-6"
        >
          ×
        </button>
      </div>
    </div>
  );
}
