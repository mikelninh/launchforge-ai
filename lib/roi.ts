export type OutcomeType = "resolved" | "completed" | "escalated" | "failed";
export type EvidenceSource = "synthetic" | "estimated" | "provider_verified";
export type CostCurrency = "EUR" | "USD";

export type Execution = {
  id: string;
  workflowId: string;
  workflowName: string;
  outcome: OutcomeType;
  baselineHumanMinutes: number;
  actualHumanMinutes: number;
  automationCost: number;
  automationCostCurrency: CostCurrency;
  revenueImpact?: number;
  qualityScore: number;
  durationSeconds?: number;
  source: EvidenceSource;
  provider?: string;
  createdAt: string;
  evidence?: string[];
};

export type RoiAssumptions = {
  loadedHourlyCost: number;
  usdToEurRate: number;
  monthlyVolume: number;
};

export function automationCostEur(execution: Execution, assumptions: RoiAssumptions) {
  if (execution.automationCostCurrency === "USD") {
    return execution.automationCost * assumptions.usdToEurRate;
  }
  return execution.automationCost;
}

export function economicsForExecution(execution: Execution, assumptions: RoiAssumptions) {
  const avoidedHumanMinutes = Math.max(
    0,
    execution.baselineHumanMinutes - execution.actualHumanMinutes,
  );
  const labourValue =
    (avoidedHumanMinutes / 60) * assumptions.loadedHourlyCost;
  const revenueImpact = execution.revenueImpact ?? 0;
  const grossValue = labourValue + revenueImpact;
  const automationSpend = automationCostEur(execution, assumptions);
  const netValue = grossValue - automationSpend;

  return {
    avoidedHumanMinutes,
    labourValue,
    revenueImpact,
    grossValue,
    automationSpend,
    netValue,
  };
}

export function summarizeEconomics(
  executions: Execution[],
  assumptions: RoiAssumptions,
) {
  const rows = executions.map((execution) =>
    economicsForExecution(execution, assumptions),
  );

  const automationSpend = rows.reduce((sum, row) => sum + row.automationSpend, 0);
  const grossValue = rows.reduce((sum, row) => sum + row.grossValue, 0);
  const netValue = grossValue - automationSpend;
  const avoidedHumanMinutes = rows.reduce(
    (sum, row) => sum + row.avoidedHumanMinutes,
    0,
  );
  const revenueImpact = rows.reduce((sum, row) => sum + row.revenueImpact, 0);
  const successful = executions.filter((item) =>
    ["resolved", "completed"].includes(item.outcome),
  ).length;
  const escalated = executions.filter((item) => item.outcome === "escalated").length;
  const failed = executions.filter((item) => item.outcome === "failed").length;
  const averageQuality = executions.length
    ? executions.reduce((sum, item) => sum + item.qualityScore, 0) /
      executions.length
    : 0;
  const roi = automationSpend > 0 ? netValue / automationSpend : 0;
  const containmentRate = executions.length ? successful / executions.length : 0;
  const verifiedExecutions = executions.filter(
    (item) => item.source === "provider_verified",
  ).length;

  return {
    automationSpend,
    grossValue,
    netValue,
    avoidedHumanMinutes,
    revenueImpact,
    successful,
    escalated,
    failed,
    averageQuality,
    roi,
    containmentRate,
    verifiedExecutions,
  };
}

export function projectMonthlyEconomics(
  executions: Execution[],
  assumptions: RoiAssumptions,
) {
  const summary = summarizeEconomics(executions, assumptions);
  const count = Math.max(1, executions.length);
  const scale = assumptions.monthlyVolume / count;
  const baselineMinutes = executions.length
    ? executions.reduce((sum, item) => sum + item.baselineHumanMinutes, 0) / count
    : 0;
  const averageSpend = summary.automationSpend / count;
  const fullHumanValue = (baselineMinutes / 60) * assumptions.loadedHourlyCost;
  const breakEvenResolutionRate = fullHumanValue > 0
    ? Math.min(1, averageSpend / fullHumanValue)
    : 0;

  return {
    monthlyNetValue: summary.netValue * scale,
    monthlyGrossValue: summary.grossValue * scale,
    monthlyAutomationSpend: summary.automationSpend * scale,
    monthlyHumanHoursSaved: (summary.avoidedHumanMinutes * scale) / 60,
    projectedResolved: Math.round(summary.successful * scale),
    projectedEscalated: Math.round(summary.escalated * scale),
    projectedFailed: Math.round(summary.failed * scale),
    breakEvenResolutionRate,
  };
}
