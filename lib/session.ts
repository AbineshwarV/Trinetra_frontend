const SESSION_COOKIE_NAME = "trinetra_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24;
const JWT_ISSUER = "trinetra";
const JWT_TYPE = "JWT";

type JwtHeader = {
  alg: "HS256";
  typ: typeof JWT_TYPE;
};

type JwtPayload = {
  iss: typeof JWT_ISSUER;
  sub: string;
  iat: number;
  exp: number;
};

function getAuthSecret(): string {
  return process.env.AUTH_SECRET || "dev-insecure-change-me";
}

function bytesToBinaryString(bytes: Uint8Array): string {
  let result = "";
  for (let index = 0; index < bytes.length; index += 1) {
    result += String.fromCharCode(bytes[index]);
  }

  return result;
}

function base64UrlEncode(input: string): string {
  const bytes = new TextEncoder().encode(input);
  return btoa(bytesToBinaryString(bytes))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlEncodeJson(value: unknown): string {
  return base64UrlEncode(JSON.stringify(value));
}

function base64UrlDecode(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new TextDecoder().decode(bytes);
}

function parseJson<T>(input: string): T | null {
  try {
    return JSON.parse(input) as T;
  } catch {
    return null;
  }
}

async function hmacBytes(input: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getAuthSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(input));
  return new Uint8Array(signature);
}

async function hmacHex(input: string): Promise<string> {
  const bytes = await hmacBytes(input);

  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacBase64Url(input: string): Promise<string> {
  const bytes = await hmacBytes(input);
  return base64UrlEncode(bytesToBinaryString(bytes));
}

function timingSafeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return result === 0;
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE_NAME;
}

export function getSessionTtlSeconds(): number {
  return SESSION_TTL_SECONDS;
}

function isJwtToken(token: string): boolean {
  return token.split(".").length === 3;
}

async function createJwtToken(userId: string): Promise<string> {
  const normalizedUserId = (userId || "").trim();

  if (!normalizedUserId) {
    throw new Error("userId is required to create a session token.");
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + SESSION_TTL_SECONDS;

  const header: JwtHeader = {
    alg: "HS256",
    typ: JWT_TYPE,
  };

  const payload: JwtPayload = {
    iss: JWT_ISSUER,
    sub: normalizedUserId,
    iat: issuedAt,
    exp: expiresAt,
  };

  const encodedHeader = base64UrlEncodeJson(header);
  const encodedPayload = base64UrlEncodeJson(payload);
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = await hmacBase64Url(signingInput);

  return `${signingInput}.${signature}`;
}

async function verifyJwtToken(token: string): Promise<boolean> {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return false;
  }

  const [encodedHeader, encodedPayload, providedSignature] = parts;
  const header = parseJson<JwtHeader>(base64UrlDecode(encodedHeader));
  const payload = parseJson<JwtPayload>(base64UrlDecode(encodedPayload));

  if (!header || header.alg !== "HS256" || header.typ !== JWT_TYPE || !payload) {
    return false;
  }

  if (payload.iss !== JWT_ISSUER || typeof payload.sub !== "string") {
    return false;
  }

  const currentTime = Math.floor(Date.now() / 1000);

  if (!Number.isFinite(payload.exp) || currentTime > payload.exp) {
    return false;
  }

  const expectedSignature = await hmacBase64Url(`${encodedHeader}.${encodedPayload}`);
  return timingSafeEqual(providedSignature, expectedSignature);
}

export async function createSessionToken(userId: string): Promise<string> {
  return createJwtToken(userId);
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) {
    return false;
  }

  return isJwtToken(token) ? verifyJwtToken(token) : false;
}

export async function getSessionUserIdFromToken(token: string | undefined): Promise<string | null> {
  if (!token) {
    return null;
  }

  if (isJwtToken(token)) {
    const parts = token.split(".");
    const payload = parseJson<JwtPayload>(base64UrlDecode(parts[1]));

    if (!payload || payload.iss !== JWT_ISSUER || typeof payload.sub !== "string") {
      return null;
    }

    const currentTime = Math.floor(Date.now() / 1000);

    if (!Number.isFinite(payload.exp) || currentTime > payload.exp) {
      return null;
    }

    const isValid = await verifyJwtToken(token);
    return isValid ? payload.sub : null;
  }

  return null;
}
