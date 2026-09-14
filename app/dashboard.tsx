"use client";

import { useMemo, useState } from "react";
import { demoExecutions, readinessChecks, workflows } from "@/lib/demo";
import { economicsForExecution, summarizeEconomics } from "@/lib/roi";

const euro = new Intl.NumberFormat("en-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

const oneDecimalEuro = new Intl.NumberFormat("en-DE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export default function Dashboard() {
  const [hourlyCost, setHourlyCost] = useState(52);
  const summary = useMemo(
    () => summarizeEconomics(demoExecutions, { loadedHourlyCost: hourlyCost }),
    [hourlyCost],
  );
  const readiness = Math.round(
    readinessChecks.reduce((sum, check) => sum + check.value, 0) /
      readinessChecks.length,
  );

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">
          <span className="brandMark">LF</span>
          <div>
            <strong>LaunchForge AI</strong>
            <span>Deployment Control Plane</span>
          </div>
        </div>
        <div className="status"><i /> Pilot environment · Live</div>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">Production OS for AI deployments</p>
          <h1>Ship agents that prove their value.</h1>
          <p className="lede">
            One control plane to design, evaluate, launch, observe and measure ROI
            across customer support, sales and operational workflows.
          </p>
        </div>
        <div className="readinessHero">
          <span>Production readiness</span>
          <strong>{readiness}%</strong>
          <small>6 evidence gates tracked</small>
        </div>
      </section>

      <section className="kpiGrid">
        <article className="kpi featured">
          <span>Net value created</span>
          <strong>{euro.format(summary.netValue)}</strong>
          <small>Across {demoExecutions.length} measured executions</small>
        </article>
        <article className="kpi">
          <span>ROI on AI spend</span>
          <strong>{summary.roi.toFixed(1)}×</strong>
          <small>{oneDecimalEuro.format(summary.automationSpend)} automation cost</small>
        </article>
        <article className="kpi">
          <span>Human time avoided</span>
          <strong>{Math.round(summary.avoidedHumanMinutes)} min</strong>
          <small>Baseline versus actual intervention</small>
        </article>
        <article className="kpi">
          <span>Average quality</span>
          <strong>{Math.round(summary.averageQuality * 100)}%</strong>
          <small>{summary.failed} failed · {summary.escalated} escalated</small>
        </article>
      </section>

      <section className="mainGrid">
        <article className="panel span2">
          <div className="panelHead">
            <div>
              <p className="eyebrow">Execution ledger</p>
              <h2>Value, traceable to every run.</h2>
            </div>
            <label className="assumption">
              Loaded labour cost
              <span>
                €<input
                  aria-label="Loaded labour cost per hour"
                  type="number"
                  min="10"
                  max="250"
                  value={hourlyCost}
                  onChange={(event) => setHourlyCost(Number(event.target.value) || 0)}
                />/h
              </span>
            </label>
          </div>

          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Run</th><th>Workflow</th><th>Outcome</th><th>Human min saved</th><th>AI cost</th><th>Net value</th><th>Quality</th>
                </tr>
              </thead>
              <tbody>
                {demoExecutions.map((execution) => {
                  const economics = economicsForExecution(execution, { loadedHourlyCost: hourlyCost });
                  return (
                    <tr key={execution.id}>
                      <td><strong>{execution.id}</strong><small>{execution.createdAt}</small></td>
                      <td>{execution.workflowName}</td>
                      <td><span className={`pill ${execution.outcome}`}>{execution.outcome.replaceAll("_", " ")}</span></td>
                      <td>{economics.avoidedHumanMinutes.toFixed(1)}</td>
                      <td>{oneDecimalEuro.format(execution.agentCost)}</td>
                      <td className={economics.netValue >= 0 ? "positive" : "negative"}>{oneDecimalEuro.format(economics.netValue)}</td>
                      <td>{Math.round(execution.qualityScore * 100)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="methodNote">
            ROI is not hidden behind a magic score. Change the labour assumption and every execution recalculates instantly.
          </p>
        </article>

        <aside className="panel">
          <p className="eyebrow">Launch gate</p>
          <h2>{readiness}% ready</h2>
          <div className="checks">
            {readinessChecks.map((check) => (
              <div className="check" key={check.label}>
                <div><span>{check.label}</span><strong>{check.value}%</strong></div>
                <div className="bar"><i style={{ width: `${check.value}%` }} /></div>
              </div>
            ))}
          </div>
          <button className="primary">Open readiness report</button>
        </aside>
      </section>

      <section className="sectionHead">
        <div>
          <p className="eyebrow">Reusable blueprints</p>
          <h2>Different workflows. Same deployment system.</h2>
        </div>
        <span className="meta">3 canonical templates</span>
      </section>

      <section className="workflowGrid">
        {workflows.map((workflow) => (
          <article className="workflow" key={workflow.id}>
            <div className="workflowTop">
              <span>{workflow.category}</span>
              <em>{workflow.risk} risk</em>
            </div>
            <h3>{workflow.name}</h3>
            <p>{workflow.description}</p>
            <div className="metric"><span>Success</span><strong>{workflow.successMetric}</strong></div>
            <div className="tools">{workflow.tools.map((tool) => <span key={tool}>{tool}</span>)}</div>
          </article>
        ))}
      </section>

      <section className="learning panel">
        <div>
          <p className="eyebrow">Compound</p>
          <h2>Every deployment must change the platform.</h2>
          <p>
            Field work only compounds when corrections become reusable capabilities.
            LaunchForge records the workaround, evidence, recurrence and product decision
            so the next deployment starts ahead.
          </p>
        </div>
        <div className="learningLoop">
          <span>Deploy</span><b>→</b><span>Observe</span><b>→</b><span>Correct</span><b>→</b><span>Generalise</span>
        </div>
      </section>
    </main>
  );
}
