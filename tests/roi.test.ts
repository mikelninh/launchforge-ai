import assert from "node:assert/strict";
import test from "node:test";
import {
  economicsForExecution,
  projectMonthlyEconomics,
  summarizeEconomics,
  type Execution,
} from "../lib/roi";

const assumptions = {
  loadedHourlyCost: 38,
  usdToEurRate: 0.92,
  monthlyVolume: 10000,
};

const resolved: Execution = {
  id: "T-1",
  workflowId: "voice-support-resolution-v1",
  workflowName: "Voice Support Resolution",
  outcome: "resolved",
  baselineHumanMinutes: 8.4,
  actualHumanMinutes: 0,
  automationCost: 0.4,
  automationCostCurrency: "EUR",
  qualityScore: 0.95,
  source: "synthetic",
  createdAt: "test",
};

test("per-run ROI subtracts automation spend from avoided labour value", () => {
  const economics = economicsForExecution(resolved, assumptions);
  assert.equal(economics.avoidedHumanMinutes, 8.4);
  assert.ok(Math.abs(economics.labourValue - 5.32) < 0.001);
  assert.ok(Math.abs(economics.netValue - 4.92) < 0.001);
});

test("USD provider cost is converted with explicit exchange assumption", () => {
  const economics = economicsForExecution(
    { ...resolved, automationCost: 0.5, automationCostCurrency: "USD" },
    assumptions,
  );
  assert.ok(Math.abs(economics.automationSpend - 0.46) < 0.001);
});

test("escalated work only credits the human minutes actually avoided", () => {
  const economics = economicsForExecution(
    { ...resolved, outcome: "escalated", actualHumanMinutes: 4.4 },
    assumptions,
  );
  assert.ok(Math.abs(economics.avoidedHumanMinutes - 4) < 0.001);
});

test("summary reports containment from outcomes, not quality score", () => {
  const summary = summarizeEconomics(
    [resolved, { ...resolved, id: "T-2", outcome: "escalated" }],
    assumptions,
  );
  assert.equal(summary.containmentRate, 0.5);
});

test("monthly projection scales selected evidence to declared volume", () => {
  const projection = projectMonthlyEconomics([resolved], assumptions);
  assert.equal(projection.projectedResolved, 10000);
  assert.ok(projection.monthlyNetValue > 0);
  assert.ok(projection.breakEvenResolutionRate > 0);
  assert.ok(projection.breakEvenResolutionRate < 0.2);
});
