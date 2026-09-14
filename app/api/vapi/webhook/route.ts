import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const message = payload?.message ?? {};

  // The demo deliberately does not persist webhook payloads server-side.
  // Live run evidence is fetched from Vapi by call ID after the call ends.
  // In production this endpoint would write normalized events to durable storage.
  console.info("launchforge.vapi.event", {
    type: message?.type ?? "unknown",
    callId: message?.call?.id ?? null,
    status: message?.status ?? null,
  });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "vapi-webhook",
    persistence: "disabled-in-demo",
  });
}
