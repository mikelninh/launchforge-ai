export type EvidenceRecord = {
  id: string;
  kind: "voice_event" | "execution" | "provider_call";
  occurredAt: string;
  workflowId?: string;
  callId?: string;
  source: "vapi" | "launchforge" | "simulator";
  payload: Record<string, unknown>;
};

export type EvidenceWriteResult = {
  configured: boolean;
  persisted: boolean;
  status?: number;
  error?: string;
};

/**
 * Server-side durable evidence adapter.
 *
 * The backing store is intentionally an HTTP contract rather than a database
 * SDK dependency. Production can point this at a Supabase Edge Function,
 * internal API, warehouse ingest endpoint, or another authenticated store.
 */
export async function writeEvidence(
  record: EvidenceRecord,
): Promise<EvidenceWriteResult> {
  const url = process.env.EVIDENCE_STORE_URL;
  const token = process.env.EVIDENCE_STORE_TOKEN;

  if (!url || !token) {
    return { configured: false, persisted: false };
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(record),
      cache: "no-store",
    });

    if (!response.ok) {
      return {
        configured: true,
        persisted: false,
        status: response.status,
        error: (await response.text()).slice(0, 500),
      };
    }

    return { configured: true, persisted: true, status: response.status };
  } catch (error) {
    return {
      configured: true,
      persisted: false,
      error: error instanceof Error ? error.message : "unknown evidence store error",
    };
  }
}

export function evidenceStoreStatus() {
  return {
    configured: Boolean(process.env.EVIDENCE_STORE_URL && process.env.EVIDENCE_STORE_TOKEN),
    adapter: "authenticated-http",
  };
}
