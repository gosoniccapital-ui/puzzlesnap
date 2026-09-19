import { NextRequest, NextResponse } from "next/server";
import {
  verifyAdminPasscode,
  createAdminToken,
  getAdminCookieOptions,
} from "@/lib/auth/admin-session";

// In-memory sliding window rate limiter for login attempts
const failedAttemptsMap = new Map<string, { count: number; resetTime: number }>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 60_000; // 1 minute

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetInSec: number } {
  const now = Date.now();

  // Auto-prune expired records to prevent unbounded memory growth under distributed scans
  if (failedAttemptsMap.size > 500) {
    for (const [key, val] of failedAttemptsMap.entries()) {
      if (now > val.resetTime) {
        failedAttemptsMap.delete(key);
      }
    }
  }

  const entry = failedAttemptsMap.get(ip);

  if (!entry || now > entry.resetTime) {
    return { allowed: true, remaining: MAX_FAILED_ATTEMPTS, resetInSec: 60 };
  }

  if (entry.count >= MAX_FAILED_ATTEMPTS) {
    const resetInSec = Math.ceil((entry.resetTime - now) / 1000);
    return { allowed: false, remaining: 0, resetInSec };
  }

  return {
    allowed: true,
    remaining: MAX_FAILED_ATTEMPTS - entry.count,
    resetInSec: Math.ceil((entry.resetTime - now) / 1000),
  };
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now();
  const entry = failedAttemptsMap.get(ip);
  if (!entry || now > entry.resetTime) {
    failedAttemptsMap.set(ip, { count: 1, resetTime: now + LOCKOUT_WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

function clearFailedAttempts(ip: string): void {
  failedAttemptsMap.delete(ip);
}

export async function POST(request: NextRequest) {
  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    // 1. Rate-limiting check
    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many failed login attempts. Please wait ${rateCheck.resetInSec}s before retrying.`,
        },
        { status: 429 }
      );
    }

    // 2. Parse request body
    const body = await request.json().catch(() => ({}));
    const passcode = typeof body?.passcode === "string" ? body.passcode.trim() : "";

    if (!passcode) {
      return NextResponse.json(
        { success: false, error: "Admin passcode is required" },
        { status: 400 }
      );
    }

    // 3. Verify passcode
    const isCorrect = verifyAdminPasscode(passcode);
    if (!isCorrect) {
      recordFailedAttempt(clientIp);
      const updatedCheck = checkRateLimit(clientIp);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid admin passcode.",
          remainingAttempts: updatedCheck.remaining,
        },
        { status: 401 }
      );
    }

    // 4. Success: clear lockout history and issue session token
    clearFailedAttempts(clientIp);
    const token = await createAdminToken();
    const cookieOptions = getAdminCookieOptions();

    const response = NextResponse.json({
      success: true,
      message: "Admin authentication successful.",
    });

    response.cookies.set(cookieOptions.name, token, cookieOptions);
    return response;
  } catch (err) {
    console.error("Admin login API error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error during authentication" },
      { status: 500 }
    );
  }
}
