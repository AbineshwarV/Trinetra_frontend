"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { apiFetch } from "@/lib/api";

interface SessionUser {
  id?: string;
  email: string;
  name?: string;
  company?: string;
  avatarUrl?: string;
}

type SessionResponse = SessionUser | { user?: SessionUser };

let cachedSessionUser: SessionUser | null | undefined;
let cachedSessionAtMs = 0;
let cachedSessionPromise: Promise<SessionUser | null> | null = null;

async function fetchSessionUser(): Promise<SessionUser | null> {
  const now = Date.now();
  const cacheFresh = cachedSessionUser !== undefined && now - cachedSessionAtMs < 10_000;
  if (cacheFresh) return cachedSessionUser;

  if (cachedSessionPromise) return cachedSessionPromise;

  cachedSessionPromise = (async () => {
    try {
      const response = await apiFetch("/api/session", { cache: "no-store" });
      if (!response.ok) {
        cachedSessionUser = null;
        cachedSessionAtMs = Date.now();
        return null;
      }

      const data = (await response.json()) as SessionResponse;
      const wrappedUser = (data as { user?: SessionUser }).user;
      const nextUser = wrappedUser !== undefined ? (wrappedUser ?? null) : (data as SessionUser);
      cachedSessionUser = nextUser;
      cachedSessionAtMs = Date.now();
      return nextUser;
    } finally {
      cachedSessionPromise = null;
    }
  })();

  return cachedSessionPromise;
}

type AnalyzerSessionState = {
  user: SessionUser | null;
  isLoading: boolean;
  clearSession: () => void;
};

const AnalyzerSessionContext = createContext<AnalyzerSessionState | null>(null);

export function AnalyzerSessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSessionUser() {
      try {
        const sessionUser = await fetchSessionUser();
        if (!isMounted) return;

        if (!sessionUser) {
          setUser(null);
          setIsLoading(false);
          router.replace("/login");
          return;
        }

        setUser(sessionUser);
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSessionUser();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      clearSession: () => {
        setUser(null);
        setIsLoading(false);
      },
    }),
    [user, isLoading]
  );

  return <AnalyzerSessionContext.Provider value={value}>{children}</AnalyzerSessionContext.Provider>;
}

export function useAnalyzerSession() {
  const context = useContext(AnalyzerSessionContext);

  if (!context) {
    throw new Error("useAnalyzerSession must be used within an AnalyzerSessionProvider.");
  }

  return context;
}
