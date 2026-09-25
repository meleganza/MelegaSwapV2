import type { ApproveCallbackOptions } from 'hooks/useApproveCallback'

/**
 * Add Liquidity token approvals (Token A / Token B → router).
 *
 * Same bounded configuration already proven for the Remove Liquidity LP approval (#85):
 * the allowance is read directly through the wallet transport and re-read every 2.5 s, so a
 * frozen multicall value or an unfinalized local approval record can no longer keep the CTA
 * on "Confirming". The live allowance stays authoritative: APPROVED only when it covers the
 * required amount; a stale local pending record stops being trusted after 30 s.
 * Polling only runs while an ERC-20 deposit amount exists (native input needs no approval).
 */
export const ADD_LIQUIDITY_APPROVAL_OPTIONS: ApproveCallbackOptions = {
  unknownAllowanceTimeoutMs: 5_000,
  pendingAllowancePollMs: 2_500,
  directAllowancePollMs: 2_500,
  pendingApprovalTimeoutMs: 30_000,
}
