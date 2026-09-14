type WorkToken = { intentId: string; version: number; workId: string };

type IntentState = { intentId: string; version: number; activeWork: string[] };

function beginIntent(intentId: string): IntentState {
  return { intentId, version: 1, activeWork: [] };
}

function planWork(state: IntentState, workId: string): WorkToken {
  state.activeWork.push(workId);
  return { intentId: state.intentId, version: state.version, workId };
}

function replaceIntent(state: IntentState, intentId: string): IntentState {
  return { intentId, version: state.version + 1, activeWork: [] };
}

function acceptResult(state: IntentState, token: WorkToken) {
  const accepted = token.intentId === state.intentId && token.version === state.version;
  return {
    accepted,
    stale: !accepted,
    activeIntent: state.intentId,
    activeVersion: state.version,
    resultIntent: token.intentId,
    resultVersion: token.version,
    workId: token.workId,
  };
}

export default async () => {
  const invoice = beginIntent("invoice_copy");
  const token = planWork(invoice, "lookup-and-send-invoice");
  const cancellation = replaceIntent(invoice, "cancel_account");
  const result = acceptResult(cancellation, token);

  return Response.json({
    ok: result.stale && !result.accepted,
    scenario: "invoice work in flight -> caller switches to cancellation -> old invoice result arrives",
    result,
  });
};

export const config = {
  path: "/api/race",
};
