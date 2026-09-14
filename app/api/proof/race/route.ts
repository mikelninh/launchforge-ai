import { NextResponse } from "next/server";
import { IntentExecutionGuard } from "@/lib/intent-execution";

export const dynamic = "force-dynamic";

export async function GET() {
  const guard = new IntentExecutionGuard("invoice_copy");
  const invoiceWork = guard.plan({ action: "invoice_copy", reference: "pending" });
  const replacementIntent = guard.beginIntent("cancel_account");
  const staleInvoiceResult = guard.resolve(invoiceWork, {
    status: "completed",
    reference: "INV-COPY-2048",
  });

  return NextResponse.json({
    ok: staleInvoiceResult.stale && !staleInvoiceResult.accepted,
    scenario: "invoice result arrives after caller switched to cancellation",
    replacementIntent,
    staleInvoiceResult,
    invariant: "A result planned under an abandoned intent cannot mutate active workflow state.",
  });
}
