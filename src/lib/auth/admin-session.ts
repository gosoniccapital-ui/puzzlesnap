/**
 * CunFashion Admin Authentication & Session Management
 * Built with Web Crypto API (W3C standard) for 100% compatibility with
 * both Next.js Edge Middleware and Node.js Serverless runtimes.
 */

export const ADMIN_COOKIE_NAME = "cunfashion_admin_session";
export const DEFAULT_SESSION_HOURS = 24;

interface AdminSessionPayload {
  role: "admin";
  iat: number;
  exp: number;
}

/**
 * Retrieves the cryptographic secret for HMAC signing.
 * Falls back to a deterministic development key if not configured,
 * while logging a security warning.
 */
export function getAdminSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret && secret.length >= 16) {
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    console.error(
      "CRITICAL: ADMIN_SESSION_SECRET is missing or too short in production environment!"
    );
  }
  return "cunfashion-admin-dev-secret-key-32-chars-minimum!";
}

/**
 * Retrieves the master admin password.
 */
export function getAdminMasterPassword(): string {
  const pass = process.env.ADMIN_MASTER_PASSWORD;
  if (pass && pass.length > 0) {
    return pass;
  }
  return "CunFashion@Admin2026!";
}

// Convert ArrayBuffer to URL-safe Base64 string
function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// Convert URL-safe Base64 string to Uint8Array
function base64UrlToUint8Array(base64Url: string): Uint8Array {
  let base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Import CryptoKey for HMAC-SHA256
async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  return await crypto.subtle.importKey(
    "raw",
    keyData as unknown as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Creates an HMAC-signed session token for the admin user.
 */
export async function createAdminToken(expiresInHours = DEFAULT_SESSION_HOURS): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInHours * 3600;

  const payload: AdminSessionPayload = {
    role: "admin",
    iat: now,
    exp,
  };

  const encoder = new TextEncoder();
  const payloadJson = JSON.stringify(payload);
  const payloadEncoded = bufferToBase64Url(encoder.encode(payloadJson).buffer as ArrayBuffer);

  const secret = getAdminSecret();
  const key = await getCryptoKey(secret);

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadEncoded) as unknown as BufferSource
  );
  const signatureEncoded = bufferToBase64Url(signatureBuffer);

  return `${payloadEncoded}.${signatureEncoded}`;
}

/**
 * Verifies the integrity, signature, and expiration of an admin session token.
 * Performs constant-time signature verification via crypto.subtle.verify.
 */
export async function verifyAdminToken(token?: string | null): Promise<boolean> {
  if (!token || typeof token !== "string") {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return false;
  }

  const [payloadEncoded, signatureEncoded] = parts;
  if (!payloadEncoded || !signatureEncoded) {
    return false;
  }

  try {
    const encoder = new TextEncoder();
    const secret = getAdminSecret();
    const key = await getCryptoKey(secret);

    const signatureBytes = base64UrlToUint8Array(signatureEncoded);
    const isValidSignature = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as unknown as BufferSource,
      encoder.encode(payloadEncoded) as unknown as BufferSource
    );

    if (!isValidSignature) {
      return false;
    }

    // Decode and verify expiration
    const payloadBytes = base64UrlToUint8Array(payloadEncoded);
    const decoder = new TextDecoder();
    const payload: AdminSessionPayload = JSON.parse(decoder.decode(payloadBytes));

    if (payload.role !== "admin") {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) {
      return false; // Token expired
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Verifies the input passcode against the configured master password.
 * Uses constant-time comparison to prevent timing attacks.
 */
export function verifyAdminPasscode(inputPasscode: string): boolean {
  const masterPassword = getAdminMasterPassword();
  if (typeof inputPasscode !== "string" || inputPasscode.length === 0) {
    return false;
  }

  const encoder = new TextEncoder();
  const a = encoder.encode(inputPasscode);
  const b = encoder.encode(masterPassword);

  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

/**
 * Standard cookie configuration for the admin session.
 */
export function getAdminCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    name: ADMIN_COOKIE_NAME,
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict" as const,
    path: "/",
    maxAge: DEFAULT_SESSION_HOURS * 3600, // 24 hours in seconds
  };
}
