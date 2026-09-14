export type RiskLevel = "low" | "medium" | "high";

export type ToolContract = {
  name: string;
  purpose: string;
  required: boolean;
  failureMode: "retry" | "escalate" | "stop";
};

export type EvalCase = {
  id: string;
  name: string;
  scenario: string;
  expectedOutcome: string;
  severity: "normal" | "edge" | "critical";
};

export type DeploymentBlueprint = {
  id: string;
  name: string;
  description: string;
  owner: string;
  successMetric: string;
  baselineHumanMinutes: number;
  riskLevel: RiskLevel;
  inputContract: string[];
  outputContract: string[];
  tools: ToolContract[];
  escalationRules: string[];
  evals: EvalCase[];
};

export function readinessScore(blueprint: DeploymentBlueprint) {
  const gates = [
    blueprint.successMetric.trim().length > 0,
    blueprint.baselineHumanMinutes > 0,
    blueprint.inputContract.length > 0,
    blueprint.outputContract.length > 0,
    blueprint.tools.length > 0,
    blueprint.escalationRules.length > 0,
    blueprint.evals.length >= 3,
  ];

  const passed = gates.filter(Boolean).length;
  return Math.round((passed / gates.length) * 100);
}
