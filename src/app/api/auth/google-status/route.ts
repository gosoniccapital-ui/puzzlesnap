import { NextResponse } from "next/server";

export async function GET() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ enabled: false }, { status: 200 });
  }

  try {
    const res = await fetch(
      "https://api.supabase.com/v1/projects/zzouaicqtzyiyldlpzjk/config/auth",
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) {
      return NextResponse.json({ enabled: false }, { status: 200 });
    }
    const data = await res.json();
    const isConfigured = Boolean(
      data.external_google_enabled && data.external_google_client_id
    );
    return NextResponse.json({ enabled: isConfigured }, { status: 200 });
  } catch {
    return NextResponse.json({ enabled: false }, { status: 200 });
  }
}
