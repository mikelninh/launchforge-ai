import type { Execution } from "./roi";

export type WorkflowTemplate = {
  id: string;
  name: string;
  category: "Support" | "Sales" | "Operations";
  description: string;
  successMetric: string;
  baselineMinutes: number;
  risk: "Low" | "Medium" | "High";
  tools: string[];
};

export const workflows: WorkflowTemplate[] = [
  {
    id: "support-resolution",
    name: "Support Resolution",
    category: "Support",
    description: "Resolve routine inbound requests, gather context, take approved actions, and escalate exceptions.",
    successMetric: "Resolved without human rework",
    baselineMinutes: 14,
    risk: "Medium",
    tools: ["CRM", "Knowledge base", "Ticketing", "Human handoff"],
  },
  {
    id: "lead-qualification",
    name: "Lead Qualification",
    category: "Sales",
    description: "Qualify inbound leads, enrich context, route by fit, and book the next action.",
    successMetric: "Qualified lead reaches next step",
    baselineMinutes: 11,
    risk: "Low",
    tools: ["CRM", "Calendar", "Enrichment", "Email / Voice"],
  },
  {
    id: "backoffice-ops",
    name: "Back-office Operations",
    category: "Operations",
    description: "Process structured requests across systems and escalate exceptions with a complete evidence trail.",
    successMetric: "Task completed without correction",
    baselineMinutes: 22,
    risk: "High",
    tools: ["ERP", "Database", "Documents", "Approval queue"],
  },
];

export const demoExecutions: Execution[] = [
  { id: "EX-1048", workflowId: "support-resolution", workflowName: "Support Resolution", outcome: "resolved", baselineHumanMinutes: 14, actualHumanMinutes: 1.5, agentCost: 0.21, qualityScore: 0.94, createdAt: "09:42" },
  { id: "EX-1047", workflowId: "lead-qualification", workflowName: "Lead Qualification", outcome: "converted", baselineHumanMinutes: 11, actualHumanMinutes: 2, agentCost: 0.31, revenueImpact: 36, qualityScore: 0.91, createdAt: "09:37" },
  { id: "EX-1046", workflowId: "backoffice-ops", workflowName: "Back-office Operations", outcome: "completed", baselineHumanMinutes: 22, actualHumanMinutes: 3, agentCost: 0.47, qualityScore: 0.97, createdAt: "09:31" },
  { id: "EX-1045", workflowId: "support-resolution", workflowName: "Support Resolution", outcome: "escalated", baselineHumanMinutes: 14, actualHumanMinutes: 8, agentCost: 0.18, qualityScore: 0.96, createdAt: "09:24" },
  { id: "EX-1044", workflowId: "lead-qualification", workflowName: "Lead Qualification", outcome: "converted", baselineHumanMinutes: 11, actualHumanMinutes: 1, agentCost: 0.27, revenueImpact: 24, qualityScore: 0.89, createdAt: "09:17" },
  { id: "EX-1043", workflowId: "backoffice-ops", workflowName: "Back-office Operations", outcome: "failed", baselineHumanMinutes: 22, actualHumanMinutes: 22, agentCost: 0.39, qualityScore: 0.42, createdAt: "09:05" },
  { id: "EX-1042", workflowId: "support-resolution", workflowName: "Support Resolution", outcome: "resolved", baselineHumanMinutes: 14, actualHumanMinutes: 0.5, agentCost: 0.19, qualityScore: 0.93, createdAt: "08:58" },
  { id: "EX-1041", workflowId: "backoffice-ops", workflowName: "Back-office Operations", outcome: "completed", baselineHumanMinutes: 22, actualHumanMinutes: 2, agentCost: 0.51, qualityScore: 0.95, createdAt: "08:46" },
];

export const readinessChecks = [
  { label: "Success criteria defined", value: 100 },
  { label: "Tool contracts validated", value: 92 },
  { label: "Synthetic evals passing", value: 94 },
  { label: "Escalation paths tested", value: 100 },
  { label: "Observability coverage", value: 88 },
  { label: "ROI baseline captured", value: 100 },
];
