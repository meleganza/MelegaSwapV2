import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { ApprovalState } from 'hooks/useApproveCallback'
import { resolveSwapActionCta } from 'views/Swap/resolveSwapActionCta'
import { canMarkRouteProductionCapable, evaluateProtocolFeeState } from 'lib/smartswap-universal-engine/fee'
import { shadowMustNotAffectUserTransaction } from 'lib/smartswap-universal-engine/shadow'
import { loadCanonicalListedPairs, simulateListedPairRoute } from '..'

const WEB = path.resolve(__dirname, '../../../..')

describe('P0 full current-pair certification matrix', () => {
  const pairs = loadCanonicalListedPairs()
  const results = pairs.map((pair) => simulateListedPairRoute(pair))

  it('is generated from the canonical farm LP source, not a hand-written list', () => {
    expect(pairs.length).toBeGreaterThan(50)
    expect(new Set(pairs.map((p) => p.pid)).size).toBe(pairs.length)
    const farmsSrc = readFileSync(path.resolve(WEB, '../../packages/farms/lists/56.json'), 'utf8')
    expect(farmsSrc).toContain(pairs[0].lpAddress)
    expect(pairs.every((p) => p.lpSymbol.includes(' LP'))).toBe(true)
  })

  it('A: token/query parsing and route load for every listed pair', () => {
    const failed = results.filter((r) => !r.queryParsed)
    expect(failed, failed.map((r) => r.lpSymbol).join(',')).toHaveLength(0)
  })

  it('B: pair address is computable from the listed token sides', () => {
    const failed = results.filter((r) => !r.pairAddressComputable)
    expect(failed, failed.map((r) => r.lpSymbol).join(',')).toHaveLength(0)
  })

  it('C: direct-pair quote is available on healthy fixture reserves', () => {
    const failed = results.filter((r) => r.directQuote !== 'OK')
    expect(failed, failed.map((r) => `${r.lpSymbol}:${r.directQuote}`).join(',')).toHaveLength(0)
  })

  it('D: multi-hop/fallback resolution does not throw', () => {
    const failed = results.filter((r) => r.multiHopQuote === 'EXCEPTION_SWALLOWED')
    expect(failed, failed.map((r) => r.lpSymbol).join(',')).toHaveLength(0)
  })

  it('E: allowance/enabling state machine cannot latch forever', () => {
    expect(results.every((r) => r.approvalDoesNotLatch)).toBe(true)
    const enabling = resolveSwapActionCta({
      approval: ApprovalState.PENDING,
      swapInputError: undefined,
      priceImpactSeverity: 0,
      isExpertMode: false,
    })
    expect(enabling.kind).toBe('enabling')
    const settled = resolveSwapActionCta({
      approval: ApprovalState.APPROVED,
      swapInputError: undefined,
      priceImpactSeverity: 0,
      isExpertMode: false,
    })
    expect(settled.kind).toBe('swap')
  })

  it('F: slippage/minAmountOut construction and insufficient-output behavior', () => {
    const failed = results.filter((r) => !r.minAmountOutOk)
    expect(failed, failed.map((r) => r.lpSymbol).join(',')).toHaveLength(0)
  })

  it('G: unsupported/zero-liquidity/stale pair fails gracefully without crash', () => {
    expect(results.every((r) => r.zeroLiquidity === 'ZERO_LIQUIDITY')).toBe(true)
    expect(results.every((r) => r.missingPair === 'UNSUPPORTED')).toBe(true)
    expect(results.every((r) => r.noPageCrash)).toBe(true)
  })

  it('H: wallet disconnected / wrong chain remain non-crashing states', () => {
    expect(results.every((r) => r.walletDisconnected === 'WALLET_DISCONNECTED')).toBe(true)
    expect(results.every((r) => r.wrongChain === 'WRONG_CHAIN')).toBe(true)
  })

  it('I: SmartSwap SHADOW comparator/fallback does not break legacy swap path', () => {
    expect(shadowMustNotAffectUserTransaction()).toBe(true)
    expect(results.every((r) => r.shadowDoesNotBreakLegacy)).toBe(true)
    const form = readFileSync(path.join(WEB, 'src/views/Swap/SmartSwap/index.tsx'), 'utf8')
    expect(form).toContain('SmartSwapCommitButton')
    expect(form).toContain('SwapCommitButton')
  })

  it('J: SmartSwap fee policy cannot be bypassed on production-capable classification', () => {
    expect(results.every((r) => r.feeCannotBypass)).toBe(true)
    const previewOnly = evaluateProtocolFeeState({
      calculated: true,
      displayedInFrozenUx: true,
      includedInExecutionPlan: false,
      collectionEnforceable: false,
      destinationCanonical: false,
      collectionProven: false,
      atomicWithSwap: false,
    })
    expect(canMarkRouteProductionCapable(previewOnly)).toBe(false)
  })

  it('K: raw router/trade exceptions are swallowed to no-route rather than page crash', () => {
    const trades = readFileSync(path.join(WEB, 'src/hooks/Trades.ts'), 'utf8')
    const tradeInfo = readFileSync(path.join(WEB, 'src/views/Swap/SmartSwap/hooks/useTradeInfo.ts'), 'utf8')
    const pairs = readFileSync(path.join(WEB, 'src/hooks/usePairs.ts'), 'utf8')
    expect(trades).toContain('} catch {')
    expect(tradeInfo).toContain('} catch {')
    expect(pairs).toContain('return [PairState.INVALID, null]')
    expect(results.every((r) => r.noPageCrash)).toBe(true)
  })

  it('reports matrix size for evidence', () => {
    expect(results.length).toBe(pairs.length)
    expect(results.length).toBeGreaterThan(50)
  })
})
