import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ToolCall = {
  id?: string;
  name?: string;
  arguments?: Record<string, unknown> | string;
  parameters?: Record<string, unknown>;
  function?: {
    name?: string;
    arguments?: Record<string, unknown> | string;
    parameters?: Record<string, unknown>;
  };
};

const demoAccount = {
  accountId: "NS-2048",
  name: "Alex Morgan",
  email: "alex@northstar.demo",
  plan: "Growth",
  status: "active",
  postcode: "10115",
};

function parseArguments(call: ToolCall) {
  const raw =
    call.arguments ??
    call.parameters ??
    call.function?.arguments ??
    call.function?.parameters ??
    {};

  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  return raw as Record<string, unknown>;
}

function executeTool(name: string, args: Record<string, unknown>) {
  if (name === "lookup_account") {
    const accountId = String(args.accountId ?? "").toUpperCase();
    const email = String(args.email ?? "").toLowerCase();
    const found = accountId === demoAccount.accountId || email === demoAccount.email;

    if (!found) {
      return {
        status: "not_found",
        message: "No matching demo account. Do not guess. Offer a human handoff.",
      };
    }

    return {
      status: "found",
      account: {
        accountId: demoAccount.accountId,
        name: demoAccount.name,
        email: demoAccount.email,
        plan: demoAccount.plan,
        accountStatus: demoAccount.status,
      },
      verification: {
        method: "postcode",
        expected: demoAccount.postcode,
        note: "For this fictional demo only. Never reveal the expected value before the caller provides it.",
      },
    };
  }

  if (name === "perform_action") {
    const action = String(args.action ?? "");
    const verified = String(args.postcode ?? "") === demoAccount.postcode;

    if (!verified) {
      return {
        status: "requires_human",
        reason: "identity_not_verified",
        message: "Identity verification failed. Do not execute an account action.",
      };
    }

    if (action === "invoice_copy") {
      return {
        status: "completed",
        action,
        reference: "INV-COPY-2048",
        delivery: "Sent to a•••@northstar.demo",
      };
    }

    if (action === "password_reset") {
      return {
        status: "completed",
        action,
        reference: "RESET-2048",
        delivery: "Reset link sent to a•••@northstar.demo",
      };
    }

    if (action === "service_status") {
      return {
        status: "completed",
        action,
        reference: "STATUS-OK",
        service: "operational",
        activeIncidents: 0,
      };
    }

    if (action === "plan_change" || action === "cancel_account") {
      return {
        status: "requires_human",
        reason: "high_impact_action",
        action,
        message: "This action requires a human approval path.",
      };
    }

    return {
      status: "requires_human",
      reason: "unsupported_action",
      message: "Unsupported action. Escalate with the caller's context.",
    };
  }

  if (name === "escalate_to_human") {
    const reason = String(args.reason ?? "unspecified");
    const summary = String(args.summary ?? "No summary supplied").slice(0, 500);
    return {
      status: "queued",
      caseId: `LF-${Math.floor(Date.now() / 1000).toString().slice(-6)}`,
      estimatedWaitMinutes: 3,
      contextAttached: true,
      reason,
      summary,
    };
  }

  return {
    status: "error",
    reason: "unknown_tool",
    message: `Unknown tool: ${name}`,
  };
}

function extractCalls(payload: any): ToolCall[] {
  const direct = payload?.message?.toolCallList;
  if (Array.isArray(direct)) return direct;

  const wrapped = payload?.message?.toolWithToolCallList;
  if (Array.isArray(wrapped)) {
    return wrapped.map((item: any) => item?.toolCall ?? item).filter(Boolean);
  }

  if (payload?.name) return [payload];
  return [];
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const calls = extractCalls(payload);

  if (!calls.length) {
    return NextResponse.json(
      { error: "No tool calls supplied" },
      { status: 400 },
    );
  }

  const results = calls.map((call) => {
    const name = String(call.name ?? call.function?.name ?? "unknown");
    const result = executeTool(name, parseArguments(call));

    return {
      name,
      toolCallId: call.id ?? `local-${name}`,
      result: JSON.stringify(result),
    };
  });

  return NextResponse.json({ results });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "launchforge-demo-tools",
    tools: ["lookup_account", "perform_action", "escalate_to_human"],
  });
}
