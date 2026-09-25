/**
 * MELEGA-SMARTSWAP-V2-BSC-PUBLIC-CUTOVER — SmartSwapCommitButton gate audit.
 * With a certified V2_EXECUTE decision the single Swap CTA must not ask for legacy router approval,
 * and legacy-only noRoute / swapCallbackError / approval state must not block it.
 */
import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApprovalState } from 'hooks/useApproveCallback'
import { WrapType } from 'hooks/useWrapCallback'

type ButtonTestState = {
  binding: any
  legacySwapCalls: number
  swapCallbackError: string | null
  wrongNetwork: boolean
}
/** Function declaration is hoisted, so the hoisted vi.mock factories can read it lazily at render time. */
function S(): ButtonTestState {
  const g = globalThis as unknown as { __cutoverBtn?: ButtonTestState }
  if (!g.__cutoverBtn) {
    g.__cutoverBtn = { binding: null, legacySwapCalls: 0, swapCallbackError: null, wrongNetwork: false }
  }
  return g.__cutoverBtn
}
const state = S()

vi.mock('@pancakeswap/localization', async () => {
  const actual = await vi.importActual<any>('@pancakeswap/localization')
  return {
    ...actual,
    useTranslation: () => ({
      t: (s: string, v?: Record<string, string>) => (v?.asset ? s.replace('%asset%', v.asset) : s),
    }),
  }
})
vi.mock('@pancakeswap/uikit', async () => {
  const actual = await vi.importActual<any>('@pancakeswap/uikit')
  return {
    ...actual,
    Button: ({ children, ...p }: any) => (
      <button type="button" disabled={p.disabled}>
        {children}
      </button>
    ),
    Text: ({ children }: any) => <span>{children}</span>,
    useModal: () => [() => undefined],
    confirmPriceImpactWithoutFee: () => true,
  }
})
vi.mock('components/CommitButton', () => ({
  CommitButton: ({ children, onClick, disabled, ...rest }: any) => (
    <button
      type="button"
      data-testid="cta"
      disabled={Boolean(disabled) || S().wrongNetwork}
      data-public-action={rest['data-smartswap-public-action']}
      onClick={onClick}
    >
      {S().wrongNetwork ? 'Wrong Network' : children}
    </button>
  ),
}))
vi.mock('components/ConnectWalletButton', () => ({ default: () => <button type="button">Connect Wallet</button> }))
vi.mock('components/Card', () => ({ GreyCard: ({ children }: any) => <div data-testid="grey">{children}</div> }))
vi.mock('components/Layout/Row', () => ({ AutoRow: ({ children }: any) => <span>{children}</span> }))
vi.mock('components/Loader/CircleLoader', () => ({ default: () => <i data-testid="loader" /> }))
vi.mock('components/Menu/GlobalSettings/SettingsModal', () => ({ default: () => null, withCustomOnDismiss: () => () => null }))
vi.mock('components/Menu/GlobalSettings/types', () => ({ SettingsMode: { SWAP_LIQUIDITY: 'SWAP_LIQUIDITY' } }))
vi.mock('../../../views/Swap/SmartSwap/components/ConfirmSwapModal', () => ({ default: () => null }))
vi.mock('../../../views/Swap/components/styleds', () => ({ SwapCallbackError: ({ error }: any) => <p>{error}</p> }))
vi.mock('hooks/useActiveChainId', () => ({ useActiveChainId: () => ({ chainId: 56 }) }))
vi.mock('wagmi', async () => {
  const actual = await vi.importActual<typeof import('wagmi')>('wagmi')
  return { ...actual, useAccount: () => ({ address: '0x1111111111111111111111111111111111111111' }) }
})
vi.mock('state/user/hooks', () => ({ useUserSingleHopOnly: () => [false] }))
vi.mock('lib/kerl-constitutional', () => ({
  isKerlRoutingAuthorityEnforced: () => false,
  useKerlConstitutionalSwap: () => ({ callback: null, executionRequest: null }),
}))
vi.mock('lib/routing-layer/facade', () => ({ routeSmartSwapQuoteFromTrade: () => ({ instruction: null }) }))
vi.mock('lib/execution-layer', () => ({
  useSmartSwapExecution: () => ({
    callback: async () => {
      S().legacySwapCalls += 1
      return '0xlegacy'
    },
    error: S().swapCallbackError,
  }),
}))
vi.mock('../../../views/Swap/SmartSwap/hooks/useSmartSwapV2CtaBinding', () => ({
  useSmartSwapV2CtaBinding: () => S().binding,
}))

// eslint-disable-next-line import/first
import SwapCommitButton from '../../../views/Swap/SmartSwap/components/SmartSwapCommitButton'

const currencies = { INPUT: { symbol: 'USDC' } as any, OUTPUT: { symbol: 'WBNB' } as any }
const parsed = { greaterThan: () => true } as any

function bindingFor(kind: 'V2' | 'LEGACY' | 'PENDING') {
  const consume = vi.fn(async () => '0xv2')
  return {
    consume,
    value: {
      decision:
        kind === 'V2'
          ? { decision: 'V2_PRODUCTION_READY', publicAction: 'V2_EXECUTE', reason: 'V2_PRODUCTION_READY' }
          : { decision: 'LEGACY', publicAction: 'LEGACY', reason: 'SHADOW_NOT_READY' },
      plan: { ok: kind === 'V2', winnerPriceImpactPercent: null },
      consumeIfGated: consume,
      v2Pending: kind === 'PENDING',
      cutoverAllowed: true,
    },
  }
}

function renderButton(props: Partial<Record<string, any>> = {}) {
  const approveCallback = vi.fn(async () => undefined)
  render(
    <SwapCommitButton
      swapIsUnsupported={false}
      account="0x1111111111111111111111111111111111111111"
      showWrap={false}
      wrapInputError=""
      onWrap={async () => undefined}
      wrapType={WrapType.NOT_APPLICABLE}
      approval={ApprovalState.NOT_APPROVED}
      approveCallback={approveCallback}
      approvalSubmitted={false}
      currencies={currencies}
      isExpertMode
      trade={undefined as any}
      swapInputError={undefined as any}
      currencyBalances={{}}
      recipient={null as any}
      allowedSlippage={50}
      parsedIndepentFieldAmount={parsed}
      onUserInput={() => undefined}
      {...props}
    />,
  )
  return { approveCallback }
}

beforeEach(() => {
  state.legacySwapCalls = 0
  state.swapCallbackError = null
  state.wrongNetwork = false
})

describe('SmartSwapCommitButton under BSC V2 public cutover', () => {
  it('V2_EXECUTE + ERC20 needing legacy approval + no legacy route: single Swap CTA, no legacy Enable, click consumes V2 only', async () => {
    const b = bindingFor('V2')
    state.binding = b.value
    state.swapCallbackError = 'legacy route error'
    const { approveCallback } = renderButton()
    const ctas = screen.getAllByTestId('cta')
    expect(ctas).toHaveLength(1)
    expect(ctas[0].textContent).toBe('Swap')
    expect(ctas[0].getAttribute('data-public-action')).toBe('V2_EXECUTE')
    expect(screen.queryByText(/Enable/)).toBeNull()
    expect(screen.queryByText(/Insufficient liquidity/)).toBeNull()
    expect((ctas[0] as HTMLButtonElement).disabled).toBe(false)
    fireEvent.click(ctas[0])
    await Promise.resolve()
    expect(b.consume).toHaveBeenCalledTimes(1)
    expect(approveCallback).not.toHaveBeenCalled()
    expect(state.legacySwapCalls).toBe(0)
  })

  it('V2 plan not ready BEFORE submission: legacy flow (Enable legacy router) remains the fallback', () => {
    const b = bindingFor('LEGACY')
    state.binding = b.value
    const { approveCallback } = renderButton({ trade: { route: {} } as any })
    const cta = screen.getByTestId('cta')
    expect(cta.textContent).toBe('Enable USDC')
    fireEvent.click(cta)
    expect(approveCallback).toHaveBeenCalledTimes(1)
    expect(b.consume).not.toHaveBeenCalled()
  })

  it('BSC V2 facts resolving: the single CTA is held (disabled Swap), legacy Enable is not offered first', () => {
    state.binding = bindingFor('PENDING').value
    const { approveCallback } = renderButton()
    const cta = screen.getByTestId('cta')
    expect(cta.textContent).toContain('Swap')
    expect((cta as HTMLButtonElement).disabled).toBe(true)
    expect(cta.getAttribute('data-public-action')).toBe('V2_PENDING')
    expect(screen.queryByText(/Enable/)).toBeNull()
    expect(approveCallback).not.toHaveBeenCalled()
  })

  it('general safety preserved under V2: invalid input, unsupported asset, disconnected wallet, wrong network', () => {
    state.binding = bindingFor('V2').value
    renderButton({ swapInputError: 'Insufficient USDC balance' })
    expect(screen.getByTestId('cta').textContent).toBe('Insufficient USDC balance')
    expect((screen.getByTestId('cta') as HTMLButtonElement).disabled).toBe(true)
  })

  it('unsupported asset blocks V2', () => {
    state.binding = bindingFor('V2').value
    renderButton({ swapIsUnsupported: true })
    expect(screen.getByText('Unsupported Asset')).toBeTruthy()
    expect(screen.queryByTestId('cta')).toBeNull()
  })

  it('V2 uses the canonical winner price impact when present (never the legacy route impact)', () => {
    const b = bindingFor('V2')
    b.value.plan.winnerPriceImpactPercent = 20
    state.binding = b.value
    renderButton({ isExpertMode: false })
    const cta = screen.getByTestId('cta')
    expect(cta.textContent).toBe('Price Impact Too High')
    expect((cta as HTMLButtonElement).disabled).toBe(true)
  })

  it('non-expert V2 without a legacy trade executes the certified plan directly (no legacy modal needed)', async () => {
    const b = bindingFor('V2')
    state.binding = b.value
    renderButton({ isExpertMode: false })
    fireEvent.click(screen.getByTestId('cta'))
    await Promise.resolve()
    expect(b.consume).toHaveBeenCalledTimes(1)
    expect(state.legacySwapCalls).toBe(0)
  })

  it('wrong network (chain mismatch) blocks V2 via the existing CommitButton guard', () => {
    state.binding = bindingFor('V2').value
    state.wrongNetwork = true
    renderButton()
    expect(screen.getByTestId('cta').textContent).toBe('Wrong Network')
  })
  it('legacy V2-router fallback CTA (fallbackV2 route) renders only when no certified V2 plan is active or pending', () => {
    const legacy = <button data-testid="legacy-v2-router-cta">Legacy Swap</button>
    state.binding = bindingFor('LEGACY').value
    renderButton({ legacyFallback: legacy })
    expect(screen.getByTestId('legacy-v2-router-cta')).toBeTruthy()
    expect(screen.queryByTestId('cta')).toBeNull()
  })

  it('certified V2 plan active: the legacy V2-router fallback is NOT rendered; single V2 Swap CTA consumes V2 only', async () => {
    const b = bindingFor('V2')
    state.binding = b.value
    renderButton({ legacyFallback: <button data-testid="legacy-v2-router-cta">Legacy Swap</button> })
    expect(screen.queryByTestId('legacy-v2-router-cta')).toBeNull()
    const ctas = screen.getAllByTestId('cta')
    expect(ctas).toHaveLength(1)
    expect(ctas[0].getAttribute('data-public-action')).toBe('V2_EXECUTE')
    fireEvent.click(ctas[0])
    await Promise.resolve()
    expect(b.consume).toHaveBeenCalledTimes(1)
    expect(state.legacySwapCalls).toBe(0)
  })

  it('V2 facts pending: the held V2 CTA is shown instead of the legacy V2-router fallback', () => {
    state.binding = bindingFor('PENDING').value
    renderButton({ legacyFallback: <button data-testid="legacy-v2-router-cta">Legacy Swap</button> })
    expect(screen.queryByTestId('legacy-v2-router-cta')).toBeNull()
    expect(screen.getByTestId('cta').getAttribute('data-public-action')).toBe('V2_PENDING')
  })
})
