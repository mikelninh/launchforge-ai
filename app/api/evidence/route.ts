import { NextResponse } from "next/server";
import { evidenceStoreStatus, writeEvidence, type EvidenceRecord } from "@/lib/evidence-store";

export const runtime = "nodejs";

function isEvidenceRecord(value: unknown): value is EvidenceRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<EvidenceRecord>;
  return Boolean(
    record.id &&
      record.kind &&
      record.occurredAt &&
      record.source &&
      record.payload &&
      typeof record.payload === "object",
  );
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  if (!isEvidenceRecord(payload)) {
    return NextResponse.json({ ok: false, error: "invalid evidence record" }, { status: 400 });
  }

  const persistence = await writeEvidence(payload);
  if (persistence.configured && !persistence.persisted) {
    return NextResponse.json({ ok: false, persistence }, { status: 502 });
  }

  return NextResponse.json({ ok: true, persistence });
}

export async function GET() {
  return NextResponse.json({ ok: true, evidenceStore: evidenceStoreStatus() });
}
