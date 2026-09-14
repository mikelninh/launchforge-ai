const account = {
  accountId: "NS-2048",
  name: "Alex Morgan",
  email: "alex@northstar.demo",
  plan: "Growth",
  status: "active",
  postcode: "10115",
};

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

function argsOf(call: ToolCall) {
  const raw = call.arguments ?? call.parameters ?? call.function?.arguments ?? call.function?.parameters ?? {};
  if (typeof raw === "string") {
    try { return JSON.parse(raw) as Record<string, unknown>; } catch { return {}; }
  }
  return raw as Record<string, unknown>;
}

function execute(name: string, args: Record<string, unknown>) {
  if (name === "lookup_account") {
    const id = String(args.accountId ?? "").toUpperCase();
    const email = String(args.email ?? "").toLowerCase();
    if (id !== account.accountId && email !== account.email) {
      return { status: "not_found", message: "No matching demo account. Offer a human handoff." };
    }
    return {
      status: "found",
      account: { accountId: account.accountId, name: account.name, email: account.email, plan: account.plan, accountStatus: account.status },
      verification: { method: "postcode" },
    };
  }

  if (name === "perform_action") {
    if (String(args.postcode ?? "") !== account.postcode) {
      return { status: "requires_human", reason: "identity_not_verified", message: "Verification failed." };
    }
    const action = String(args.action ?? "");
    if (action === "invoice_copy") return { status: "completed", action, reference: "INV-COPY-2048", delivery: "Sent to a•••@northstar.demo" };
    if (action === "password_reset") return { status: "completed", action, reference: "RESET-2048", delivery: "Reset link sent to a•••@northstar.demo" };
    if (action === "service_status") return { status: "completed", action, reference: "STATUS-OK", service: "operational", activeIncidents: 0 };
    return { status: "requires_human", reason: "action_not_allow_listed", message: "Only low-risk actions are autonomous." };
  }

  if (name === "escalate_to_human") {
    return {
      status: "queued",
      caseId: `LF-${String(Date.now()).slice(-6)}`,
      contextAttached: true,
      reason: String(args.reason ?? "unspecified"),
      summary: String(args.summary ?? "").slice(0, 500),
    };
  }

  return { status: "error", reason: "unknown_tool" };
}

function extractCalls(payload: any): ToolCall[] {
  const message = payload?.message ?? {};
  if (Array.isArray(message.toolCallList)) return message.toolCallList;
  if (Array.isArray(message.toolWithToolCallList)) return message.toolWithToolCallList.map((item: any) => item?.toolCall ?? item).filter(Boolean);
  if (payload?.name) return [payload];
  return [];
}

export default async (req: Request) => {
  if (req.method === "GET") {
    return Response.json({ ok: true, service: "launchforge-public-tools", tools: ["lookup_account", "perform_action", "escalate_to_human"] });
  }
  if (req.method !== "POST") return Response.json({ error: "method_not_allowed" }, { status: 405 });

  const payload = await req.json().catch(() => ({}));
  const calls = extractCalls(payload);
  if (!calls.length) return Response.json({ error: "no_tool_calls" }, { status: 400 });

  const results = calls.map((call) => {
    const name = String(call.name ?? call.function?.name ?? "unknown");
    return { name, toolCallId: call.id ?? `local-${name}`, result: JSON.stringify(execute(name, argsOf(call))) };
  });

  return Response.json({ results });
};

export const config = {
  path: "/api/tools",
};
