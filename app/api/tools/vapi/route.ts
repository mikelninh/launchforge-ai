import { NextResponse } from "next/server";
import { executeDemoTool } from "@/lib/tool-policy";

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
    const result = executeDemoTool(name, parseArguments(call));

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
