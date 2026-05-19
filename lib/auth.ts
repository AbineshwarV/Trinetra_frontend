const TOKEN_STORAGE_KEY = "trinetra_access_token";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.sessionStorage.getItem(TOKEN_STORAGE_KEY);
    return value && value.trim() ? value : null;
  } catch {
    return null;
  }
}

export function setAccessToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!token) {
      window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      return;
    }
    const value = token.trim();
    if (!value) {
      window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      return;
    }
    window.sessionStorage.setItem(TOKEN_STORAGE_KEY, value);
  } catch {
    // ignore storage failures (private mode, blocked storage, etc.)
  }
}

export function clearAccessToken(): void {
  setAccessToken(null);
}

