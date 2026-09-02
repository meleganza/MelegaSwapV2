import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { ApprovalState } from 'hooks/useApproveCallback'
import { resolveSwapActionCta, shouldClearApprovalSubmitted } from '../resolveSwapActionCta'

const WEB = path.resolve(__dirname, '../../..')

function load(rel: string) {
  return readFileSync(path.join(WEB, rel), 'utf8')
}

describe('P0 Smart Swap action CTA — one button, Enabling must settle', () => {
  it('A: insufficient allowance renders one enable CTA only', () => {
    const cta = resolveSwapActionCta({
      approval: ApprovalState.NOT_APPROVED,
      swapInputError: undefined,
      priceImpactSeverity: 0,
      isExpertMode: false,
    })
    expect(cta.showApproveFlow).toBe(true)
    expect(cta.kind).toBe('enable')
    expect(cta.buttonCount).toBe(1)
    expect(cta.enableDisabled).toBe(false)
  })

  it('B: approval submitted renders one Enabling CTA only, no ghost sibling', () => {
    const cta = resolveSwapActionCta({
      approval: ApprovalState.PENDING,
      swapInputError: undefined,
      priceImpactSeverity: 0,
      isExpertMode: false,
    })
    expect(cta.showApproveFlow).toBe(true)
    expect(cta.kind).toBe('enabling')
    expect(cta.buttonCount).toBe(1)
    expect(cta.enableDisabled).toBe(true)
  })

  it('C: approval success + sufficient allowance exits Enabling and becomes swap-ready', () => {
    const cta = resolveSwapActionCta({
      approval: ApprovalState.APPROVED,
      swapInputError: undefined,
      priceImpactSeverity: 0,
      isExpertMode: false,
    })
    expect(cta.showApproveFlow).toBe(false)
    expect(cta.kind).toBe('swap')
    expect(cta.buttonCount).toBe(1)
  })

  it('D: approval failure/revert/rejection exits Enabling and returns actionable enable', () => {
    const cta = resolveSwapActionCta({
      approval: ApprovalState.NOT_APPROVED,
      swapInputError: undefined,
      priceImpactSeverity: 0,
      isExpertMode: false,
    })
    expect(cta.kind).toBe('enable')
    expect(cta.enableDisabled).toBe(false)
    expect(cta.buttonCount).toBe(1)
    expect(shouldClearApprovalSubmitted(ApprovalState.NOT_APPROVED)).toBe(true)
    expect(shouldClearApprovalSubmitted(ApprovalState.UNKNOWN)).toBe(true)
    expect(shouldClearApprovalSubmitted(ApprovalState.PENDING)).toBe(false)
  })

  it('E: stale allowance after receipt does not latch Enabling once pending is cleared', () => {
    const afterReceiptStale = resolveSwapActionCta({
      approval: ApprovalState.NOT_APPROVED,
      swapInputError: undefined,
      priceImpactSeverity: 0,
      isExpertMode: false,
    })
    expect(afterReceiptStale.kind).not.toBe('enabling')
    expect(afterReceiptStale.kind).toBe('enable')
    expect(afterReceiptStale.enableDisabled).toBe(false)
  })

  it('F: account or chain change clears pending session flag per existing convention', () => {
    const form = load('src/views/Swap/SmartSwap/index.tsx')
    expect(form).toContain('setApprovalSubmitted(false)')
    expect(form).toContain('}, [account, chainId])')
    expect(form).toContain('shouldClearApprovalSubmitted(approval)')
    expect(form).toContain('unknownAllowanceTimeoutMs: 5_000')
    expect(form).toContain('pendingAllowancePollMs: 2_500')
    expect(form).toContain('pendingApprovalTimeoutMs: 30_000')
  })

  it('G: exactly one action button in the action container for every state', () => {
    for (const approval of [
      ApprovalState.NOT_APPROVED,
      ApprovalState.PENDING,
      ApprovalState.APPROVED,
      ApprovalState.UNKNOWN,
    ]) {
      const cta = resolveSwapActionCta({
        approval,
        swapInputError: approval === ApprovalState.UNKNOWN ? 'Enter an amount' : undefined,
        priceImpactSeverity: 0,
        isExpertMode: false,
      })
      expect(cta.buttonCount).toBe(1)
    }

    const smart = load('src/views/Swap/SmartSwap/components/SmartSwapCommitButton.tsx')
    const v2 = load('src/views/Swap/components/SwapCommitButton.tsx')
    for (const source of [smart, v2]) {
      expect(source).toContain('data-swap-action-cta')
      expect(source).toContain('data-swap-action-count={actionCta.buttonCount}')
      expect(source).not.toContain('width="48%"')
      expect(source).not.toContain('<RowBetween data-swap-approval-actions>')
      expect((source.match(/<CommitButton/g) ?? []).length).toBeGreaterThanOrEqual(2)
      expect(source).toContain('width="100%"')
    }
  })

  it('H: swap quote/router/fee/minReceived/calldata logic remains on existing call sites', () => {
    const smart = load('src/views/Swap/SmartSwap/components/SmartSwapCommitButton.tsx')
    const v2 = load('src/views/Swap/components/SwapCommitButton.tsx')
    expect(smart).toContain('routeSmartSwapQuoteFromTrade')
    expect(smart).toContain('useSmartSwapExecution')
    expect(v2).toContain('routeV2SwapQuote')
    expect(v2).toContain('useV2SwapExecution')
    expect(load('src/lib/routing-layer/facade.ts')).toContain('export function routeSmartSwapQuoteFromTrade')
    expect(load('src/views/Swap/SmartSwap/utils/exchange.ts')).toContain('computeSlippageAdjustedAmounts')
  })
})
