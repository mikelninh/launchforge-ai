export type IntentVersion = {
  id: string;
  key: string;
  version: number;
  createdAt: number;
};

export type PlannedWork<T = unknown> = {
  workId: string;
  intentId: string;
  intentVersion: number;
  payload: T;
};

export type WorkResolution<T = unknown> = {
  accepted: boolean;
  stale: boolean;
  activeIntent: IntentVersion;
  work: PlannedWork;
  result: T;
  reason?: "stale_intent";
};

/**
 * IntentExecutionGuard prevents an asynchronous result planned under an older
 * caller intent from mutating the active workflow after the caller changes
 * their mind. It is deliberately provider-agnostic and can sit in front of
 * voice, chat, browser, or back-office agent tools.
 */
export class IntentExecutionGuard {
  private active: IntentVersion;
  private nextVersion = 1;
  private nextWorkId = 1;

  constructor(initialKey = "unclassified") {
    this.active = this.makeIntent(initialKey);
  }

  get activeIntent() {
    return { ...this.active };
  }

  beginIntent(key: string) {
    const normalized = key.trim().toLowerCase() || "unclassified";
    if (normalized === this.active.key) return this.activeIntent;
    this.active = this.makeIntent(normalized);
    return this.activeIntent;
  }

  plan<T>(payload: T): PlannedWork<T> {
    return {
      workId: `work-${this.nextWorkId++}`,
      intentId: this.active.id,
      intentVersion: this.active.version,
      payload,
    };
  }

  resolve<TPayload, TResult>(
    work: PlannedWork<TPayload>,
    result: TResult,
  ): WorkResolution<TResult> {
    const stale =
      work.intentId !== this.active.id ||
      work.intentVersion !== this.active.version;

    return {
      accepted: !stale,
      stale,
      activeIntent: this.activeIntent,
      work: work as PlannedWork,
      result,
      ...(stale ? { reason: "stale_intent" as const } : {}),
    };
  }

  private makeIntent(key: string): IntentVersion {
    const version = this.nextVersion++;
    return {
      id: `intent-${version}`,
      key: key.trim().toLowerCase() || "unclassified",
      version,
      createdAt: Date.now(),
    };
  }
}

export function classifyDemoIntent(text: string) {
  const value = text.toLowerCase();
  if (/\b(cancel|close|terminate)\b/.test(value)) return "cancel_account";
  if (/\b(human|person|agent|representative)\b/.test(value)) return "human_handoff";
  if (/\b(invoice|bill|receipt)\b/.test(value)) return "invoice_copy";
  if (/\b(password|login|sign in|reset)\b/.test(value)) return "password_reset";
  if (/\b(status|outage|service down|incident)\b/.test(value)) return "service_status";
  return "unclassified";
}
