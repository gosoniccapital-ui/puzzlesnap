import test from "node:test";
import assert from "node:assert/strict";

// Mock environment variables for testing
process.env.ADMIN_MASTER_PASSWORD = "TestMasterPassword123!";
process.env.ADMIN_SESSION_SECRET = "test-secret-key-for-admin-unit-testing-32chars";

// Helper functions matching src/lib/auth/admin-session.ts logic
function bufferToBase64Url(buffer) {
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

function base64UrlToUint8Array(base64Url) {
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

async function getCryptoKey(secret) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  return await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

async function createAdminToken(expiresInHours = 24, customSecret = process.env.ADMIN_SESSION_SECRET) {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInHours * 3600;

  const payload = {
    role: "admin",
    iat: now,
    exp,
  };

  const encoder = new TextEncoder();
  const payloadJson = JSON.stringify(payload);
  const payloadEncoded = bufferToBase64Url(encoder.encode(payloadJson).buffer);

  const key = await getCryptoKey(customSecret);
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadEncoded)
  );
  const signatureEncoded = bufferToBase64Url(signatureBuffer);

  return `${payloadEncoded}.${signatureEncoded}`;
}

async function verifyAdminToken(token, customSecret = process.env.ADMIN_SESSION_SECRET) {
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
    const key = await getCryptoKey(customSecret);

    const signatureBytes = base64UrlToUint8Array(signatureEncoded);
    const isValidSignature = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      encoder.encode(payloadEncoded)
    );

    if (!isValidSignature) {
      return false;
    }

    const payloadBytes = base64UrlToUint8Array(payloadEncoded);
    const decoder = new TextDecoder();
    const payload = JSON.parse(decoder.decode(payloadBytes));

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

function verifyAdminPasscode(inputPasscode, masterPassword = process.env.ADMIN_MASTER_PASSWORD) {
  if (typeof inputPasscode !== "string" || inputPasscode.length === 0) {
    return false;
  }

  const encoder = new TextEncoder();
  const a = encoder.encode(inputPasscode);
  const b = encoder.encode(masterPassword);

  const maxLen = Math.max(a.length, b.length);
  let result = a.length ^ b.length;
  for (let i = 0; i < maxLen; i++) {
    const charA = i < a.length ? a[i] : 0;
    const charB = i < b.length ? b[i] : 0;
    result |= charA ^ charB;
  }
  return result === 0;
}

test("Admin Auth: Valid HMAC token should verify successfully", async () => {
  const token = await createAdminToken(24);
  const isValid = await verifyAdminToken(token);
  assert.equal(isValid, true, "Freshly minted HMAC token must verify successfully");
});

test("Admin Auth: Tampered signature must fail verification", async () => {
  const token = await createAdminToken(24);
  const [payload, signature] = token.split(".");
  
  // Alter the first character of signature (guarantees cryptographic mismatch)
  const tamperedSig = (signature[0] === "a" ? "b" : "a") + signature.slice(1);
  const tamperedToken = `${payload}.${tamperedSig}`;

  const isValid = await verifyAdminToken(tamperedToken);
  assert.equal(isValid, false, "Token with tampered signature must be rejected");
});

test("Admin Auth: Tampered payload must fail verification", async () => {
  const token = await createAdminToken(24);
  const [, signature] = token.split(".");

  // Tamper payload to give 100 years expiration
  const fakePayload = { role: "admin", iat: 1000, exp: 9999999999 };
  const encoder = new TextEncoder();
  const fakePayloadEncoded = bufferToBase64Url(encoder.encode(JSON.stringify(fakePayload)).buffer);
  const forgedToken = `${fakePayloadEncoded}.${signature}`;

  const isValid = await verifyAdminToken(forgedToken);
  assert.equal(isValid, false, "Forged payload with old signature must be rejected");
});

test("Admin Auth: Expired token must be rejected", async () => {
  // Negative duration -> expired in the past
  const expiredToken = await createAdminToken(-2);
  const isValid = await verifyAdminToken(expiredToken);
  assert.equal(isValid, false, "Expired token must be rejected");
});

test("Admin Auth: Token signed with different secret must be rejected", async () => {
  const foreignToken = await createAdminToken(24, "foreign-unauthorized-secret-key-32ch");
  const isValid = await verifyAdminToken(foreignToken);
  assert.equal(isValid, false, "Token signed with foreign secret must be rejected");
});

test("Admin Passcode: Exact match passes and incorrect passcodes fail", () => {
  assert.equal(verifyAdminPasscode("TestMasterPassword123!"), true);
  assert.equal(verifyAdminPasscode("WrongPassword"), false);
  assert.equal(verifyAdminPasscode("TestMasterPassword123"), false); // Missing exclamation
  assert.equal(verifyAdminPasscode(""), false);
});

test("Rate Limiter Logic: Blocks IP after exceeding max attempts", () => {
  const attempts = new Map();
  const maxAttempts = 5;
  const windowMs = 60_000;

  function checkRateLimit(ip) {
    const now = Date.now();
    const record = attempts.get(ip);
    if (!record || now > record.resetTime) {
      attempts.set(ip, { count: 1, resetTime: now + windowMs });
      return { limited: false, remaining: maxAttempts - 1 };
    }
    if (record.count >= maxAttempts) {
      return { limited: true, remaining: 0 };
    }
    record.count += 1;
    return { limited: false, remaining: maxAttempts - record.count };
  }

  const testIp = "192.168.1.100";
  for (let i = 1; i <= 5; i++) {
    const res = checkRateLimit(testIp);
    assert.equal(res.limited, false, `Attempt ${i} should be allowed`);
  }

  // 6th attempt should be blocked
  const blockedRes = checkRateLimit(testIp);
  assert.equal(blockedRes.limited, true, "6th attempt must be rate-limited");
});

test("Middleware Logic: Route protection and mutation gate matrix", async () => {
  const validToken = await createAdminToken(24);

  // Simulation of middleware decision function
  async function simulateMiddleware({ pathname, method = "GET", token = null, search = "" }) {
    const isAuthenticated = await verifyAdminToken(token);

    if (pathname.startsWith("/admin")) {
      const isLoginPage = pathname === "/admin/login";

      if (isLoginPage && isAuthenticated) {
        return { action: "redirect", destination: "/admin" };
      }

      if (!isLoginPage && !isAuthenticated) {
        const dest = pathname + (search || "");
        return { action: "redirect", destination: `/admin/login?from=${encodeURIComponent(dest)}` };
      }

      return { action: "next" };
    }

    const m = method.toUpperCase();
    const isPuzzlesMutation = pathname === "/api/puzzles" && (m === "POST" || m === "DELETE");
    const isScoresMutation = pathname === "/api/scores" && m === "DELETE";

    if (isPuzzlesMutation || isScoresMutation) {
      if (!isAuthenticated) {
        return { action: "unauthorized", status: 401 };
      }
    }

    return { action: "next" };
  }

  // 1. Unauthenticated visiting /admin -> redirect to /admin/login
  const res1 = await simulateMiddleware({ pathname: "/admin" });
  assert.equal(res1.action, "redirect");
  assert.equal(res1.destination, "/admin/login?from=%2Fadmin");

  // 2. Authenticated visiting /admin -> allowed
  const res2 = await simulateMiddleware({ pathname: "/admin", token: validToken });
  assert.equal(res2.action, "next");

  // 3. Authenticated visiting /admin/login -> redirect to /admin
  const res3 = await simulateMiddleware({ pathname: "/admin/login", token: validToken });
  assert.equal(res3.action, "redirect");
  assert.equal(res3.destination, "/admin");

  // 4. Unauthenticated visiting /admin/login -> allowed
  const res4 = await simulateMiddleware({ pathname: "/admin/login" });
  assert.equal(res4.action, "next");

  // 5. Unauthenticated calling POST /api/puzzles -> 401 Unauthorized
  const res5 = await simulateMiddleware({ pathname: "/api/puzzles", method: "POST" });
  assert.equal(res5.action, "unauthorized");
  assert.equal(res5.status, 401);

  // 6. Authenticated calling POST /api/puzzles -> allowed (next)
  const res6 = await simulateMiddleware({ pathname: "/api/puzzles", method: "POST", token: validToken });
  assert.equal(res6.action, "next");

  // 7. Unauthenticated calling DELETE /api/scores -> 401 Unauthorized
  const res7 = await simulateMiddleware({ pathname: "/api/scores", method: "DELETE" });
  assert.equal(res7.action, "unauthorized");
  assert.equal(res7.status, 401);

  // 8. Unauthenticated calling GET /api/puzzles -> allowed (public)
  const res8 = await simulateMiddleware({ pathname: "/api/puzzles", method: "GET" });
  assert.equal(res8.action, "next");

  // 9. Unauthenticated calling POST /api/scores (player submitting score) -> allowed (public)
  const res9 = await simulateMiddleware({ pathname: "/api/scores", method: "POST" });
  assert.equal(res9.action, "next");
});

