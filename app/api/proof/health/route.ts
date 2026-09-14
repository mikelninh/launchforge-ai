import { NextResponse } from "next/server";
import { evalSummary } from "@/lib/evals";

export const dynamic = "force-dynamic";

export async function GET() {
  const evals = evalSummary();
  return NextResponse.json({
    ok: evals.launchable,
    service: "launchforge-ai",
    version: "0.3.0",
    evidence: {
      reliabilityEvals: evals,
      intentVersioning: "implemented-and-regression-tested",
      deterministicToolPolicy: "implemented-and-regression-tested",
      roiMath: "implemented-and-regression-tested",
      providerVerifiedVoice: process.env.VAPI_PRIVATE_API_KEY ? "configured" : "awaiting-credentials",
      durableEvidenceStore: process.env.EVIDENCE_STORE_URL ? "configured" : "awaiting-dedicated-store",
    },
  });
}
