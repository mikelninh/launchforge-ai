import { NextResponse } from "next/server";
import { evidenceStoreStatus, writeEvidence } from "@/lib/evidence-store";

export const runtime = "nodejs";

function safeEventPayload(message: any) {
  return {
    type: message?.type ?? "unknown",
    status: message?.status ?? null,
    endedReason: message?.endedReason ?? null,
    timestamp: message?.timestamp ?? null,
  };
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const message = payload?.message ?? {};
  const callId = String(message?.call?.id ?? "unknown");
  const eventType = String(message?.type ?? "unknown");

  const persistence = await writeEvidence({
    id: `vapi:${callId}:${eventType}:${Date.now()}`,
    kind: "voice_event",
    occurredAt: new Date().toISOString(),
    workflowId: "voice-support-resolution-v1",
    callId: callId === "unknown" ? undefined : callId,
    source: "vapi",
    payload: safeEventPayload(message),
  });

  console.info("launchforge.vapi.event", {
    type: eventType,
    callId: callId === "unknown" ? null : callId,
    status: message?.status ?? null,
    persisted: persistence.persisted,
  });

  return NextResponse.json({ ok: true, persistence });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "vapi-webhook",
    persistence: evidenceStoreStatus(),
  });
}
