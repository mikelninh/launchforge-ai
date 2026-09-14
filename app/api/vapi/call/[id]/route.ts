import { NextResponse } from "next/server";

export const runtime = "nodejs";

function secondsBetween(start?: string, end?: string) {
  if (!start || !end) return null;
  const value = (new Date(end).getTime() - new Date(start).getTime()) / 1000;
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function transcriptFromCall(call: any) {
  if (typeof call?.artifact?.transcript === "string") return call.artifact.transcript;
  if (typeof call?.transcript === "string") return call.transcript;
  if (Array.isArray(call?.messages)) {
    return call.messages
      .filter((item: any) => item?.role && item?.message)
      .map((item: any) => `${item.role}: ${item.message}`)
      .join("\n");
  }
  return "";
}

function detectOutcome(call: any) {
  const text = JSON.stringify(call?.analysis ?? {}).toLowerCase();
  const endedReason = String(call?.endedReason ?? "").toLowerCase();
  const messages = JSON.stringify(call?.messages ?? {}).toLowerCase();

  if (endedReason.includes("error") || endedReason.includes("failed")) return "failed";
  if (messages.includes("escalate_to_human") || endedReason.includes("transfer")) return "escalated";
  if (text.includes("false") && text.includes("success")) return "failed";
  return "resolved";
}

function qualityFromCall(call: any) {
  const analysis = call?.analysis ?? {};
  const candidates = [
    analysis?.successEvaluation,
    analysis?.structuredData?.quality_score,
    analysis?.structuredData?.qualityScore,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "number") {
      const normalized = candidate > 1 ? candidate / 100 : candidate;
      return Math.max(0, Math.min(1, normalized));
    }
    if (candidate === true || candidate === "true" || candidate === "pass") return 1;
    if (candidate === false || candidate === "false" || candidate === "fail") return 0.45;
  }

  const transcript = transcriptFromCall(call);
  if (!transcript) return 0.6;
  if (detectOutcome(call) === "failed") return 0.5;
  if (detectOutcome(call) === "escalated") return 0.93;
  return 0.95;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const apiKey = process.env.VAPI_PRIVATE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        configured: false,
        error: "VAPI_PRIVATE_API_KEY is not configured. Live calls still work with a public key; provider-verified cost requires the private key.",
      },
      { status: 503 },
    );
  }

  const response = await fetch(`https://api.vapi.ai/call/${encodeURIComponent(id)}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    return NextResponse.json(
      { configured: true, error: "Unable to fetch Vapi call", status: response.status, body },
      { status: response.status },
    );
  }

  const call = await response.json();
  const costUsd = Number(call?.cost ?? call?.costBreakdown?.total ?? 0);

  return NextResponse.json({
    configured: true,
    id: call.id,
    status: call.status,
    endedReason: call.endedReason,
    durationSeconds: secondsBetween(call.startedAt, call.endedAt),
    providerCostUsd: Number.isFinite(costUsd) ? costUsd : 0,
    outcome: detectOutcome(call),
    qualityScore: qualityFromCall(call),
    transcript: transcriptFromCall(call),
    analysis: call.analysis ?? null,
    costBreakdown: call.costBreakdown ?? null,
    source: "provider_verified",
  });
}
