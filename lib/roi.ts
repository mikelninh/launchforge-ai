export type OutcomeType = "resolved" | "converted" | "completed" | "escalated" | "failed";

export type Execution = {
  id: string;
  workflowId: string;
  workflowName: string;
  outcome: OutcomeType;
  baselineHumanMinutes: number;
  actualHumanMinutes: number;
  agentCost: number;
  revenueImpact?: number;
  qualityScore: number;
  createdAt: string;
};

export type RoiAssumptions = {
  loadedHourlyCost: number;
};

export function economicsForExecution(execution: Execution, assumptions: RoiAssumptions) {
  const avoidedHumanMinutes = Math.max(
    0,
    execution.baselineHumanMinutes - execution.actualHumanMinutes,
  );
  const labourValue =
    (avoidedHumanMinutes / 60) * assumptions.loadedHourlyCost;
  const revenueImpact = execution.revenueImpact ?? 0;
  const grossValue = labourValue + revenueImpact;
  const netValue = grossValue - execution.agentCost;

  return {
    avoidedHumanMinutes,
    labourValue,
    revenueImpact,
    grossValue,
    agentCost: execution.agentCost,
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

  const automationSpend = rows.reduce((sum, row) => sum + row.agentCost, 0);
  const grossValue = rows.reduce((sum, row) => sum + row.grossValue, 0);
  const netValue = grossValue - automationSpend;
  const avoidedHumanMinutes = rows.reduce(
    (sum, row) => sum + row.avoidedHumanMinutes,
    0,
  );
  const revenueImpact = rows.reduce((sum, row) => sum + row.revenueImpact, 0);
  const successful = executions.filter((item) =>
    ["resolved", "converted", "completed"].includes(item.outcome),
  ).length;
  const escalated = executions.filter((item) => item.outcome === "escalated").length;
  const failed = executions.filter((item) => item.outcome === "failed").length;
  const averageQuality = executions.length
    ? executions.reduce((sum, item) => sum + item.qualityScore, 0) /
      executions.length
    : 0;
  const roi = automationSpend > 0 ? netValue / automationSpend : 0;

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
  };
}
