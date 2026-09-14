"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Vapi from "@vapi-ai/web";
import { flagshipCase, supportBlueprint, supportedActions } from "@/lib/case";
import { evalSummary, reliabilityEvals } from "@/lib/evals";
import { makeSimulatedExecution, readinessChecks, syntheticExecutions } from "@/lib/demo";
import {
  economicsForExecution,
  projectMonthlyEconomics,
  summarizeEconomics,
  type Execution,
  type OutcomeType,
  type RoiAssumptions,
} from "@/lib/roi";
import { buildTransientVapiAssistant } from "@/lib/voice/vapi-assistant";

const euro = new Intl.NumberFormat("en-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const euro2 = new Intl.NumberFormat("en-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percent = new Intl.NumberFormat("en-DE", {
  style: "percent",
  maximumFractionDigits: 0,
});

const STORAGE_KEY = "launchforge-live-executions-v1";

type CallState = "idle" | "connecting" | "live" | "ending" | "ended" | "error";
type EvidenceMode = "synthetic" | "live";

type TranscriptLine = {
  role: "user" | "assistant" | "system";
  text: string;
  at: string;
};

type TraceEvent = {
  type: string;
  detail: string;
  at: string;
};

function timeLabel() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function statusLabel(source: Execution["source"]) {
  if (source === "provider_verified") return "Provider verified";
  if (source === "estimated") return "Estimated live/demo";
  return "Synthetic evidence";
}

function outcomeClass(outcome: OutcomeType) {
  return outcome === "resolved" || outcome === "completed"
    ? "good"
    : outcome === "escalated"
      ? "warn"
      : "bad";
}

export default function Dashboard() {
  const [hourlyCost, setHourlyCost] = useState(flagshipCase.baseline.loadedHourlyCostEur);
  const [monthlyVolume, setMonthlyVolume] = useState(flagshipCase.baseline.monthlyCalls);
  const [usdToEurRate, setUsdToEurRate] = useState(0.92);
  const [liveExecutions, setLiveExecutions] = useState<Execution[]>([]);
  const [evidenceMode, setEvidenceMode] = useState<EvidenceMode>("synthetic");
  const [callState, setCallState] = useState<CallState>("idle");
  const [callError, setCallError] = useState("");
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [trace, setTrace] = useState<TraceEvent[]>([]);
  const [endSignal, setEndSignal] = useState(0);

  const vapiRef = useRef<any>(null);
  const callIdRef = useRef<string | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const transcriptRef = useRef<TranscriptLine[]>([]);
  const toolNamesRef = useRef<string[]>([]);
  const escalatedRef = useRef(false);
  const finalizingRef = useRef(false);

  const vapiPublicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
  const vapiAssistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
  const liveConfigured = Boolean(vapiPublicKey);

  const assumptions: RoiAssumptions = useMemo(
    () => ({ loadedHourlyCost: hourlyCost, usdToEurRate, monthlyVolume }),
    [hourlyCost, monthlyVolume, usdToEurRate],
  );

  const evals = useMemo(() => evalSummary(), []);
  const pilotGate = useMemo(() => {
    const hardGatesPass = readinessChecks
      .filter((item) => item.gate)
      .every((item) => item.value >= 90);
    return hardGatesPass && evals.launchable;
  }, [evals]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) setLiveExecutions(parsed.slice(0, 50));
    } catch {
      // Local evidence is optional. Corrupt browser state should never break the demo.
    }
  }, []);

  useEffect(() => {
    if (!vapiPublicKey) return;

    const vapi = new Vapi(vapiPublicKey);
    vapiRef.current = vapi;

    const onCallStart = () => {
      setCallState("live");
      startedAtRef.current = Date.now();
      addTrace("call.started", "Realtime voice session connected");
    };

    const onCallEnd = () => {
      setCallState("ended");
      addTrace("call.ended", "Voice provider ended the session");
      setEndSignal((value) => value + 1);
    };

    const onMessage = (message: any) => {
      const discoveredCallId = message?.call?.id ?? message?.callId;
      if (discoveredCallId) callIdRef.current = String(discoveredCallId);

      if (message?.type === "transcript" && message?.transcript) {
        const role = message?.role === "assistant" ? "assistant" : "user";
        const line: TranscriptLine = {
          role,
          text: String(message.transcript),
          at: timeLabel(),
        };
        transcriptRef.current = [...transcriptRef.current, line].slice(-40);
        setTranscript(transcriptRef.current);
      }

      if (message?.type === "tool-calls") {
        const calls = Array.isArray(message?.toolCallList)
          ? message.toolCallList
          : Array.isArray(message?.toolWithToolCallList)
            ? message.toolWithToolCallList.map((item: any) => item?.toolCall ?? item)
            : [];

        calls.forEach((call: any) => {
          const name = String(call?.name ?? call?.function?.name ?? "tool");
          toolNamesRef.current = [...toolNamesRef.current, name];
          if (name === "escalate_to_human") escalatedRef.current = true;
          addTrace("tool.called", name);
        });
      }

      if (message?.type === "user-interrupted") {
        addTrace("voice.interruption", "Caller interrupted the assistant");
      }

      if (message?.type === "status-update" && message?.status) {
        addTrace("provider.status", String(message.status));
      }
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);

    return () => {
      try {
        vapi.stop();
      } catch {
        // no-op
      }
    };
  }, [vapiPublicKey]);

  useEffect(() => {
    if (!endSignal) return;
    void finalizeLiveCall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endSignal]);

  function addTrace(type: string, detail: string) {
    setTrace((current) => [{ type, detail, at: timeLabel() }, ...current].slice(0, 24));
  }

  function persistExecution(execution: Execution) {
    setLiveExecutions((current) => {
      const next = [execution, ...current].slice(0, 50);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Browser persistence is best-effort in the public demo.
      }
      return next;
    });
    setEvidenceMode("live");
  }

  async function startLiveCall() {
    if (!vapiRef.current || !vapiPublicKey) return;

    callIdRef.current = null;
    startedAtRef.current = Date.now();
    transcriptRef.current = [];
    toolNamesRef.current = [];
    escalatedRef.current = false;
    finalizingRef.current = false;
    setTranscript([]);
    setTrace([]);
    setCallError("");
    setCallState("connecting");
    addTrace("call.requested", "Starting Vapi web call");

    try {
      const origin = window.location.origin;
      const assistant = vapiAssistantId || buildTransientVapiAssistant(origin);
      const call = await vapiRef.current.start(assistant as any);
      if (call?.id) callIdRef.current = String(call.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to start voice call";
      setCallError(message);
      setCallState("error");
      addTrace("call.failed", message);
    }
  }

  function stopLiveCall() {
    if (!vapiRef.current) return;
    setCallState("ending");
    addTrace("call.stop_requested", "User ended the demo call");
    try {
      vapiRef.current.stop();
    } catch (error) {
      setCallError(error instanceof Error ? error.message : "Unable to stop call");
      setCallState("error");
    }
  }

  async function finalizeLiveCall() {
    if (finalizingRef.current) return;
    finalizingRef.current = true;

    const durationSeconds = Math.max(
      1,
      Math.round((Date.now() - (startedAtRef.current ?? Date.now())) / 1000),
    );
    const callId = callIdRef.current;
    const estimatedCostEur = (durationSeconds / 60) * 0.12;
    const defaultOutcome: OutcomeType = escalatedRef.current ? "escalated" : "resolved";
    const transcriptWords = transcriptRef.current.reduce(
      (sum, line) => sum + line.text.split(/\s+/).filter(Boolean).length,
      0,
    );

    let execution: Execution = {
      id: `LIVE-${Date.now().toString().slice(-6)}`,
      workflowId: supportBlueprint.id,
      workflowName: supportBlueprint.name,
      outcome: defaultOutcome,
      baselineHumanMinutes: supportBlueprint.baselineHumanMinutes,
      actualHumanMinutes: defaultOutcome === "escalated" ? 4.2 : 0,
      automationCost: Number(estimatedCostEur.toFixed(3)),
      automationCostCurrency: "EUR",
      qualityScore: transcriptWords > 20 ? (defaultOutcome === "escalated" ? 0.95 : 0.93) : 0.76,
      durationSeconds,
      source: "estimated",
      provider: "Vapi live · cost estimated",
      createdAt: timeLabel(),
      evidence: [
        "live.web_call",
        ...toolNamesRef.current.map((name) => `tool.${name}`),
        `transcript_words.${transcriptWords}`,
      ],
    };

    if (callId) {
      try {
        const response = await fetch(`/api/vapi/call/${encodeURIComponent(callId)}`, {
          cache: "no-store",
        });
        if (response.ok) {
          const provider = await response.json();
          execution = {
            ...execution,
            id: `VAPI-${String(callId).slice(0, 8)}`,
            outcome: provider.outcome ?? execution.outcome,
            automationCost: Number(provider.providerCostUsd ?? 0),
            automationCostCurrency: "USD",
            qualityScore: Number(provider.qualityScore ?? execution.qualityScore),
            durationSeconds: Number(provider.durationSeconds ?? execution.durationSeconds),
            source: "provider_verified",
            provider: "Vapi",
            evidence: [
              ...(execution.evidence ?? []),
              "provider.call_record",
              "provider.cost",
              provider.transcript ? "provider.transcript" : "provider.transcript_missing",
            ],
          };
          addTrace("evidence.verified", "Fetched provider call record and cost");
        } else {
          addTrace("evidence.estimated", "Private Vapi key not configured; using transparent cost estimate");
        }
      } catch {
        addTrace("evidence.estimated", "Provider evidence fetch failed; estimate retained");
      }
    } else {
      addTrace("evidence.estimated", "Call ID unavailable; estimate retained");
    }

    persistExecution(execution);
    finalizingRef.current = false;
  }

  function runSimulator() {
    const execution = makeSimulatedExecution(liveExecutions.length + 1);
    persistExecution(execution);
    setCallState("idle");
    setTranscript([
      { role: "user", text: "Hi, I need a copy of my latest invoice. My account is NS-2048.", at: timeLabel() },
      { role: "assistant", text: "Absolutely. I found the demo account. What postcode should I use to verify the request?", at: timeLabel() },
      { role: "user", text: "10115.", at: timeLabel() },
      { role: "assistant", text: "Done — the demo invoice copy was generated with reference INV-COPY-2048.", at: timeLabel() },
    ]);
    setTrace([
      { type: "resolution.confirmed", detail: "INV-COPY-2048", at: timeLabel() },
      { type: "tool.called", detail: "perform_action", at: timeLabel() },
      { type: "tool.called", detail: "lookup_account", at: timeLabel() },
      { type: "call.started", detail: "LaunchForge simulator", at: timeLabel() },
    ]);
  }

  function clearLocalRuns() {
    setLiveExecutions([]);
    setEvidenceMode("synthetic");
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // no-op
    }
  }

  const activeExecutions = evidenceMode === "live" && liveExecutions.length
    ? liveExecutions
    : syntheticExecutions;
  const summary = useMemo(
    () => summarizeEconomics(activeExecutions, assumptions),
    [activeExecutions, assumptions],
  );
  const projection = useMemo(
    () => projectMonthlyEconomics(activeExecutions, assumptions),
    [activeExecutions, assumptions],
  );
  const latest = liveExecutions[0];
  const latestEconomics = latest ? economicsForExecution(latest, assumptions) : null;

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brandMark">LF</span>
          <div>
            <strong>LaunchForge AI</strong>
            <span>AI Deployment Control Plane</span>
          </div>
        </div>
        <div className={`status ${pilotGate ? "ready" : "blocked"}`}>
          <i /> {pilotGate ? "Pilot-ready" : "Launch blocked"} · production gaps visible
        </div>
      </header>

      <section className="hero">
        <div className="heroCopy">
          <p className="eyebrow">Flagship deployment proof</p>
          <h1>Deploy voice agents with evidence, not vibes.</h1>
          <p className="lede">
            One reusable control plane for agent tools, reliability gates, traces and ROI.
            The voice provider is replaceable. The deployment system compounds.
          </p>
          <div className="heroActions">
            <button
              className="primary big"
              onClick={callState === "live" || callState === "connecting" ? stopLiveCall : startLiveCall}
              disabled={!liveConfigured || callState === "ending"}
            >
              {callState === "connecting"
                ? "Connecting…"
                : callState === "live"
                  ? "End live call"
                  : callState === "ending"
                    ? "Ending…"
                    : "Start live voice demo"}
            </button>
            <button className="secondary big" onClick={runSimulator}>Run evidence simulator</button>
          </div>
          <p className="configNote">
            {liveConfigured
              ? `Vapi public key detected${vapiAssistantId ? " · saved assistant mode" : " · transient assistant mode"}.`
              : "Live mic mode needs NEXT_PUBLIC_VAPI_PUBLIC_KEY. The simulator and full economics case work without credentials."}
          </p>
          {callError ? <p className="errorBox">{callError}</p> : null}
        </div>

        <div className="proofCard">
          <div className="proofTop">
            <span>Case</span>
            <strong>{flagshipCase.customer}</strong>
          </div>
          <h2>Voice Support Resolution</h2>
          <p>{flagshipCase.goal}</p>
          <div className="proofStats">
            <div><span>Baseline AHT</span><strong>{flagshipCase.baseline.humanMinutesPerCall} min</strong></div>
            <div><span>Monthly volume</span><strong>{flagshipCase.baseline.monthlyCalls.toLocaleString()}</strong></div>
            <div><span>Hard safety gates</span><strong>4 / 4</strong></div>
            <div><span>Reliability eval</span><strong>{evals.score}%</strong></div>
          </div>
        </div>
      </section>

      <section className="metricStrip">
        <article>
          <span>Projected monthly net value</span>
          <strong>{euro.format(projection.monthlyNetValue)}</strong>
          <small>At {monthlyVolume.toLocaleString()} calls / month</small>
        </article>
        <article>
          <span>Containment</span>
          <strong>{percent.format(summary.containmentRate)}</strong>
          <small>{summary.successful} resolved · {summary.escalated} escalated · {summary.failed} failed</small>
        </article>
        <article>
          <span>Human capacity returned</span>
          <strong>{Math.round(projection.monthlyHumanHoursSaved).toLocaleString()} h</strong>
          <small>Baseline vs measured intervention</small>
        </article>
        <article>
          <span>ROI on automation spend</span>
          <strong>{summary.roi.toFixed(1)}×</strong>
          <small>{summary.verifiedExecutions} provider-verified run{summary.verifiedExecutions === 1 ? "" : "s"}</small>
        </article>
      </section>

      <section className="labGrid">
        <article className="panel voicePanel">
          <div className="panelHead">
            <div>
              <p className="eyebrow">Live deployment lab</p>
              <h2>Call → tools → outcome → evidence</h2>
            </div>
            <span className={`callBadge ${callState}`}>{callState}</span>
          </div>

          <div className="demoHint">
            <strong>Try this:</strong> “I need my latest invoice. My account is NS-2048.” Then use postcode <strong>10115</strong>.
            Or ask to cancel the account and watch the deterministic policy force a human handoff.
          </div>

          <div className="voiceVisualizer" aria-hidden="true">
            <i /><i /><i /><i /><i /><i /><i /><i /><i />
          </div>

          <div className="transcriptBox">
            {transcript.length ? transcript.map((line, index) => (
              <div className={`transcriptLine ${line.role}`} key={`${line.at}-${index}`}>
                <span>{line.role === "assistant" ? "Nova" : line.role === "user" ? "Caller" : "System"}</span>
                <p>{line.text}</p>
                <time>{line.at}</time>
              </div>
            )) : (
              <div className="emptyState">Start a live call or run the simulator. The transcript will appear here.</div>
            )}
          </div>
        </article>

        <aside className="panel tracePanel">
          <div className="panelHead compact">
            <div>
              <p className="eyebrow">Execution trace</p>
              <h2>What actually happened</h2>
            </div>
          </div>
          <div className="traceList">
            {trace.length ? trace.map((event, index) => (
              <div className="traceRow" key={`${event.at}-${event.type}-${index}`}>
                <i />
                <div><strong>{event.type}</strong><span>{event.detail}</span></div>
                <time>{event.at}</time>
              </div>
            )) : <div className="emptyState small">No trace events yet.</div>}
          </div>

          {latest && latestEconomics ? (
            <div className="latestOutcome">
              <div><span>Latest outcome</span><strong className={outcomeClass(latest.outcome)}>{latest.outcome}</strong></div>
              <div><span>Evidence</span><strong>{statusLabel(latest.source)}</strong></div>
              <div><span>Net value</span><strong>{euro2.format(latestEconomics.netValue)}</strong></div>
              <div><span>Quality</span><strong>{percent.format(latest.qualityScore)}</strong></div>
            </div>
          ) : null}
        </aside>
      </section>

      <section className="sectionHead">
        <div>
          <p className="eyebrow">Business case</p>
          <h2>Every assumption is visible and editable.</h2>
        </div>
        <div className="modeSwitch">
          <button className={evidenceMode === "synthetic" ? "active" : ""} onClick={() => setEvidenceMode("synthetic")}>Synthetic baseline</button>
          <button className={evidenceMode === "live" ? "active" : ""} disabled={!liveExecutions.length} onClick={() => setEvidenceMode("live")}>My live runs ({liveExecutions.length})</button>
        </div>
      </section>

      <section className="economicsGrid">
        <article className="panel assumptionsPanel">
          <p className="eyebrow">Economic inputs</p>
          <div className="inputGrid">
            <label>
              Loaded human cost
              <span><b>€</b><input type="number" min="10" max="250" value={hourlyCost} onChange={(event) => setHourlyCost(Number(event.target.value) || 0)} /><em>/ hour</em></span>
            </label>
            <label>
              Monthly voice volume
              <span><input type="number" min="100" max="1000000" step="100" value={monthlyVolume} onChange={(event) => setMonthlyVolume(Number(event.target.value) || 0)} /><em>calls</em></span>
            </label>
            <label>
              USD → EUR for verified Vapi cost
              <span><input type="number" min="0.5" max="1.5" step="0.01" value={usdToEurRate} onChange={(event) => setUsdToEurRate(Number(event.target.value) || 0)} /><em>rate</em></span>
            </label>
            <label>
              Baseline human handle time
              <span><input disabled value={flagshipCase.baseline.humanMinutesPerCall} /><em>minutes</em></span>
            </label>
          </div>
          <p className="methodNote">No hidden ROI score. Labour value = avoided human minutes × loaded hourly cost. Provider cost is subtracted per run. Revenue impact is zero in this case, so the business case does not depend on speculative sales attribution.</p>
        </article>

        <article className="panel projectionPanel">
          <p className="eyebrow">Projected operating case</p>
          <div className="bigProjection">{euro.format(projection.monthlyNetValue)}<span>net value / month</span></div>
          <div className="projectionRows">
            <div><span>Gross labour value</span><strong>{euro.format(projection.monthlyGrossValue)}</strong></div>
            <div><span>Automation spend</span><strong>-{euro.format(projection.monthlyAutomationSpend)}</strong></div>
            <div><span>Resolved without human rework</span><strong>{projection.projectedResolved.toLocaleString()}</strong></div>
            <div><span>Break-even resolution rate</span><strong>{percent.format(projection.breakEvenResolutionRate)}</strong></div>
          </div>
          <small className="projectionDisclaimer">Projection scales the selected evidence set. Synthetic mode is a modelled case, not a customer claim. Switch to live runs as evidence accumulates.</small>
        </article>
      </section>

      <section className="panel ledgerPanel">
        <div className="panelHead">
          <div>
            <p className="eyebrow">ROI ledger</p>
            <h2>Value traceable to every execution.</h2>
          </div>
          {liveExecutions.length ? <button className="textButton" onClick={clearLocalRuns}>Clear local runs</button> : null}
        </div>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Run</th><th>Evidence</th><th>Outcome</th><th>Duration</th><th>Human min saved</th><th>Automation cost</th><th>Net value</th><th>Quality</th>
              </tr>
            </thead>
            <tbody>
              {activeExecutions.slice(0, 14).map((execution) => {
                const economics = economicsForExecution(execution, assumptions);
                return (
                  <tr key={execution.id}>
                    <td><strong>{execution.id}</strong><small>{execution.provider ?? execution.workflowName}</small></td>
                    <td><span className={`sourceTag ${execution.source}`}>{statusLabel(execution.source)}</span></td>
                    <td><span className={`pill ${outcomeClass(execution.outcome)}`}>{execution.outcome}</span></td>
                    <td>{execution.durationSeconds ? `${Math.round(execution.durationSeconds / 6) / 10} min` : "—"}</td>
                    <td>{economics.avoidedHumanMinutes.toFixed(1)}</td>
                    <td>{euro2.format(economics.automationSpend)}</td>
                    <td className={economics.netValue >= 0 ? "positive" : "negative"}>{euro2.format(economics.netValue)}</td>
                    <td>{percent.format(execution.qualityScore)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="sectionHead">
        <div>
          <p className="eyebrow">Reliability before theatre</p>
          <h2>{evals.passed}/{reliabilityEvals.length} pass · {evals.partial} partial · {evals.failed} fail</h2>
        </div>
        <span className={`launchChip ${evals.launchable ? "pass" : "fail"}`}>{evals.launchable ? "Critical launch gates pass" : "Launch blocked"}</span>
      </section>

      <section className="evalGrid">
        {reliabilityEvals.map((item) => (
          <article className={`evalCard ${item.status}`} key={item.id}>
            <div className="evalTop"><span>{item.id}</span><em>{item.severity}</em><b>{item.status}</b></div>
            <h3>{item.scenario}</h3>
            <p>{item.evidence}</p>
            <small><strong>Platform learning:</strong> {item.platformLearning}</small>
          </article>
        ))}
      </section>

      <section className="twoCol">
        <article className="panel">
          <p className="eyebrow">Deterministic action boundary</p>
          <h2>The model can ask. The tool decides.</h2>
          <div className="actionList">
            {supportedActions.map((action) => (
              <div key={action.id}><span>{action.label}</span><small>{action.description}</small></div>
            ))}
          </div>
        </article>

        <article className="panel compoundPanel">
          <p className="eyebrow">The compounding asset</p>
          <h2>Each deployment makes the next one cheaper.</h2>
          <p>LaunchForge captures the business baseline, tool contract, failure mode, correction and reusable product decision. The customer-specific map is temporary; the verified patterns are the asset.</p>
          <div className="loop"><span>Deploy</span><b>→</b><span>Observe</span><b>→</b><span>Correct</span><b>→</b><span>Generalise</span></div>
          <div className="openGap"><strong>Current learning:</strong> E12 shows we still need intent-version IDs so a stale tool result cannot mutate a new caller intent. That becomes a platform capability, not a one-off patch.</div>
        </article>
      </section>

      <footer>
        <strong>LaunchForge AI</strong>
        <span>Demo data is fictional. Synthetic evidence is labelled. Live provider evidence is only marked verified when fetched from Vapi.</span>
      </footer>
    </main>
  );
}
