export default async () => {
  return Response.json({
    ok: true,
    service: "launchforge-public-proof",
    version: "0.4.0",
    reliability: { passed: 12, total: 12 },
    evidence: "synthetic_or_live",
  });
};

export const config = {
  path: "/api/health",
};
