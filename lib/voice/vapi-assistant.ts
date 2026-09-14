export function buildTransientVapiAssistant(origin: string) {
  const toolServer = `${origin}/api/tools/vapi`;
  const webhookServer = `${origin}/api/vapi/webhook`;

  return {
    name: "LaunchForge Voice Resolution Demo",
    firstMessage:
      "Hi, you've reached Northstar Cloud support. I'm Nova, an AI support agent. I can help with account access, invoice copies, service status, or route you to a person. For this demo, you can use account NS-2048.",
    firstMessageInterruptionsEnabled: true,
    maxDurationSeconds: 300,
    backgroundSound: "off",
    clientMessages: [
      "transcript",
      "tool-calls",
      "status-update",
      "speech-update",
      "user-interrupted",
    ],
    serverMessages: ["end-of-call-report", "status-update", "tool-calls"],
    server: {
      url: webhookServer,
      timeoutSeconds: 20,
    },
    model: {
      provider: "openai",
      model: "gpt-4.1-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `You are Nova, the voice support agent in a fictional enterprise deployment demo for Northstar Cloud.

Your goal is not to sound human. Your goal is to complete supported tasks reliably, use tools correctly, and fail safely.

Operating rules:
- Keep spoken responses concise, warm, and clear. Usually 1-2 short sentences.
- Never invent account data, policy, tool results, or action confirmations.
- Before any account action, identify the demo account using account ID NS-2048 or email alex@northstar.demo.
- For actions, ask the caller for postcode verification. In this demo the caller may provide 10115. Never reveal the expected postcode before they provide it.
- Supported autonomous actions are ONLY invoice_copy, password_reset, and service_status.
- plan changes, cancellation, legal requests, payment disputes, and other high-impact actions always require a human handoff and are intentionally absent from the autonomous action schema.
- If the caller asks for a person, escalate immediately. Do not persuade them to stay with the AI.
- If a tool says requires_human, not_found, or fails twice, use escalate_to_human.
- If intent is ambiguous, ask one clarifying question before using a tool.
- If the caller changes intent, abandon the previous plan. Never use a stale result to claim the old request completed.
- When a task completes, state the reference returned by the tool and ask whether anything else is needed.
- This is a demo. Do not claim that any real email, invoice, account, payment, or service was changed.

Tool discipline:
1. lookup_account before perform_action.
2. perform_action only with caller-supplied postcode.
3. escalate_to_human for risky, unsupported, unverified, or human-requested cases.
4. Never treat a spoken promise as completion; only an accepted current-intent tool result can confirm completion.`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "lookup_account",
            description:
              "Look up the fictional Northstar Cloud demo account by account ID or email. Use before any account action.",
            parameters: {
              type: "object",
              properties: {
                accountId: {
                  type: "string",
                  description: "Account ID supplied by the caller, for example NS-2048",
                },
                email: {
                  type: "string",
                  description: "Email supplied by the caller",
                },
              },
            },
          },
          server: { url: toolServer },
        },
        {
          type: "function",
          function: {
            name: "perform_action",
            description:
              "Execute one of the explicitly allow-listed low-risk demo actions after account lookup and caller-supplied postcode verification. High-impact actions are not available through this tool.",
            parameters: {
              type: "object",
              properties: {
                action: {
                  type: "string",
                  enum: ["invoice_copy", "password_reset", "service_status"],
                },
                accountId: { type: "string" },
                postcode: {
                  type: "string",
                  description: "Postcode spoken by the caller. Never fill this from hidden knowledge.",
                },
              },
              required: ["action", "accountId", "postcode"],
            },
          },
          server: { url: toolServer },
        },
        {
          type: "function",
          function: {
            name: "escalate_to_human",
            description:
              "Create a structured human handoff. Use when the caller asks for a person, identity cannot be verified, the action is high-impact, or a tool cannot safely complete the request.",
            parameters: {
              type: "object",
              properties: {
                reason: { type: "string" },
                summary: {
                  type: "string",
                  description: "Concise context for the human agent",
                },
              },
              required: ["reason", "summary"],
            },
          },
          server: { url: toolServer },
        },
      ],
    },
  };
}
