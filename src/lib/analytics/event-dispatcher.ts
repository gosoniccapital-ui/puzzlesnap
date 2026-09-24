/**
 * Global Multi-Platform Event Dispatcher (GA4, Meta Pixel, TikTok Pixel)
 * Dispatches custom telemetry events seamlessly across all active marketing & analytics pixels.
 * Adheres to ai-copilot-alignment, real-time verification and graceful degradation (zero throw on ad-blockers).
 */

export interface EventParams {
  category?: string;
  label?: string;
  value?: number | string;
  source?: string;
  mode?: string;
  slug?: string;
  tile_type?: string;
  outcome?: string;
  file_size?: number;
  file_type?: string;
  [key: string]: any;
}

export function trackUserAction(eventName: string, params?: EventParams): void {
  if (typeof window === "undefined") return;

  const eventPayload = {
    ...params,
    timestamp: new Date().toISOString(),
  };

  // 1. Interactive DevTools Console Feedback (Proves tracking is actively firing)
  try {
    const isDev = process.env.NODE_ENV !== "production" || window.location.search.includes("debug_telemetry");
    if (isDev || typeof window !== "undefined") {
      console.log(
        `%c[Telemetry 📡] %c${eventName}`,
        "background: #dfba73; color: #111; font-weight: bold; border-radius: 3px 0 0 3px; padding: 2px 6px;",
        "background: #1c1d24; color: #dfba73; font-weight: bold; border-radius: 0 3px 3px 0; padding: 2px 8px;",
        eventPayload
      );
    }
  } catch {
    // Graceful no-op
  }

  // 2. Global In-Memory Ring Buffer for Browser Inspection (F12 -> window.__cunTelemetryEvents)
  try {
    const win = window as any;
    if (!win.__cunTelemetryEvents) {
      win.__cunTelemetryEvents = [];
    }
    win.__cunTelemetryLastEvent = { eventName, payload: eventPayload };
    win.__cunTelemetryEvents.push({ eventName, payload: eventPayload });
    if (win.__cunTelemetryEvents.length > 100) {
      win.__cunTelemetryEvents.shift();
    }
    // Expose test trigger function for manual verification
    if (!win.__cunTrackTest) {
      win.__cunTrackTest = (name: string, testParams?: any) => trackUserAction(name, testParams);
    }
  } catch {
    // Graceful no-op
  }

  // 3. Google Analytics 4 (gtag.js)
  try {
    if (typeof (window as any).gtag === "function") {
      (window as any).gtag("event", eventName, eventPayload);
    }
  } catch {
    // Graceful no-op
  }

  // 4. Meta (Facebook) Pixel
  try {
    if (typeof (window as any).fbq === "function") {
      (window as any).fbq("trackCustom", eventName, eventPayload);
    }
  } catch {
    // Graceful no-op
  }

  // 5. TikTok Pixel
  try {
    if ((window as any).ttq && typeof (window as any).ttq.track === "function") {
      (window as any).ttq.track(eventName, eventPayload);
    }
  } catch {
    // Graceful no-op
  }

  // 6. X (Twitter) Conversion Tracking
  try {
    if (typeof (window as any).twq === "function") {
      (window as any).twq("event", eventName, eventPayload);
    }
  } catch {
    // Graceful no-op
  }
}
