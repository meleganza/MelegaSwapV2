import { ApprovalState } from 'hooks/useApproveCallback'

export type SwapActionKind = 'enable' | 'enabling' | 'swap'

export function resolveSwapActionCta(input: {
  approval: ApprovalState
  swapInputError?: string | null
  priceImpactSeverity: number
  isExpertMode: boolean
}): {
  showApproveFlow: boolean
  kind: SwapActionKind
  buttonCount: 1
  enableDisabled: boolean
} {
  const highImpactBlocked = input.priceImpactSeverity > 3 && !input.isExpertMode
  const needsApproval =
    input.approval === ApprovalState.NOT_APPROVED || input.approval === ApprovalState.PENDING
  const showApproveFlow = !input.swapInputError && needsApproval && !highImpactBlocked

  if (input.approval === ApprovalState.PENDING) {
    return { showApproveFlow, kind: 'enabling', buttonCount: 1, enableDisabled: true }
  }

  if (showApproveFlow) {
    return {
      showApproveFlow: true,
      kind: 'enable',
      buttonCount: 1,
      enableDisabled: input.approval !== ApprovalState.NOT_APPROVED,
    }
  }

  return { showApproveFlow: false, kind: 'swap', buttonCount: 1, enableDisabled: true }
}

export function shouldClearApprovalSubmitted(approval: ApprovalState): boolean {
  return approval !== ApprovalState.PENDING && approval !== ApprovalState.APPROVED
}
