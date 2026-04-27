"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface SessionUser {
  email: string;
  name: string;
}

type AnalyzerSessionState = {
  user: SessionUser | null;
  isLoading: boolean;
  clearSession: () => void;
};

const AnalyzerSessionContext = createContext<AnalyzerSessionState | null>(null);

export function AnalyzerSessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSessionUser() {
      try {
        const response = await fetch("/api/session", { cache: "no-store" });

        if (!isMounted) {
          return;
        }

        if (!response.ok) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        const data = (await response.json()) as { user?: SessionUser };
        setUser(data.user ?? null);
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
  }, []);

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