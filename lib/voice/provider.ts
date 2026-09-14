export type VoiceProviderName = "retell" | "vapi" | "livekit";

export type VoiceCallRequest = {
  workflowId: string;
  phoneNumber?: string;
  variables?: Record<string, string | number | boolean>;
  metadata?: Record<string, string>;
};

export type VoiceCallResult = {
  provider: VoiceProviderName;
  externalCallId: string;
  status: "queued" | "ringing" | "in_progress" | "completed" | "failed";
  startedAt?: string;
  endedAt?: string;
};

export type VoiceCallEvent = {
  externalCallId: string;
  type:
    | "call.started"
    | "call.ended"
    | "tool.called"
    | "handoff.requested"
    | "handoff.completed"
    | "call.failed";
  at: string;
  payload?: Record<string, unknown>;
};

export interface VoiceProvider {
  readonly name: VoiceProviderName;
  startCall(request: VoiceCallRequest): Promise<VoiceCallResult>;
  getCall(externalCallId: string): Promise<VoiceCallResult>;
  normalizeWebhook(payload: unknown): VoiceCallEvent[];
}

export type VoiceExecutionMetrics = {
  callDurationSeconds: number;
  humanHandoffSeconds: number;
  providerCost: number;
  taskCompleted: boolean;
  escalationOccurred: boolean;
  qualityScore: number;
  revenueImpact?: number;
};

/**
 * LaunchForge owns the economics and execution model. Voice vendors are adapters.
 * This keeps ROI, evals, traces and learning portable across Retell, Vapi, LiveKit,
 * future providers, and non-voice channels.
 */
export function voiceMetricsToRoiInput(metrics: VoiceExecutionMetrics) {
  return {
    actualHumanMinutes: metrics.humanHandoffSeconds / 60,
    agentCost: metrics.providerCost,
    revenueImpact: metrics.revenueImpact ?? 0,
    qualityScore: metrics.qualityScore,
  };
}
