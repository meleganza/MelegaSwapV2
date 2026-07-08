import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  resolveTreasuryCollector,
  resolveMarcoToken,
  readSmartRouterChainProfile,
  buildMainnetReadinessMatrix,
  getPhase2Verdict,
  MELEGA_SMART_ROUTER_PHASE,
} from 'lib/melega-smart-router'

const MARCO_BSC = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'
const COLLECTOR = '0x2222222222222222222222222222222222222222'

describe('registry resolution — Phase 2', () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it('preserves Phase 1 adapter while targeting WRAPPER', () => {
    expect(MELEGA_SMART_ROUTER_PHASE.current).toBe('ADAPTER')
    expect(MELEGA_SMART_ROUTER_PHASE.target).toBe('WRAPPER')
  })

  it('resolves MARCO via Runtime registry first on BNB Chain', () => {
    const marco = resolveMarcoToken(56)
    expect(marco.marcoTokenAddress?.toLowerCase()).toBe(MARCO_BSC.toLowerCase())
    expect(marco.resolution.source).toBe('treasury-runtime')
    expect(marco.status).toBe('active')
  })

  it('never fabricates treasury collector when registry and env empty', () => {
    const collector = resolveTreasuryCollector(56)
    expect(collector.collectorAddress).toBeUndefined()
    expect(collector.status).not.toBe('active')
    expect(collector.resolution.unavailable).toBe(true)
  })

  it('falls back to env collector when runtime and kerl unavailable', () => {
    vi.stubEnv('NEXT_PUBLIC_TREASURY_COLLECTOR_BSC', COLLECTOR)
    const collector = resolveTreasuryCollector(56)
    expect(collector.collectorAddress).toBe(COLLECTOR)
    expect(collector.resolution.source).toBe('env')
    expect(collector.status).toBe('active')
  })

  it('reads smart-router chain profile for BNB execution router', () => {
    const profile = readSmartRouterChainProfile(56)
    expect(profile?.executionRouter).toBe('0xC6665d98Efd81f47B03801187eB46cbC63F328B0')
    expect(profile?.wrapperStatus).toBe('planned')
  })

  it('mainnet readiness matrix returns PARTIAL verdict', () => {
    const matrix = buildMainnetReadinessMatrix(56)
    expect(matrix.find((r) => r.id === 'wrapper_contract')?.level).toBe('BLOCKED')
    expect(matrix.find((r) => r.id === 'marco_registry')?.level).toBe('READY')
    expect(getPhase2Verdict(matrix)).toBe('MELEGA_SMART_ROUTER_PHASE2_PARTIAL')
  })
})
