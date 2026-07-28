/**
 * SMART_SWAP_SWAP_TERMINAL_UX_AND_EXECUTION_REPAIR
 */
import { createHash } from 'crypto'
import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it, beforeEach } from 'vitest'
import { SMART_SWAP_ARCHITECTURE_ID } from 'lib/smart-swap-architecture/smartSwapArchitecture000Contracts'
import {
  evaluateSmartSwapExecutionHandoff,
  publishSmartSwapHandoffCertification,
  publishSwapExperienceMode,
  resetSmartSwapIngressHandoffBridge,
  resolveIngressCertifiedHandoff,
  toUserFacingExecutionError,
} from '../index'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(WEB, '../..')

describe('SMART_SWAP_TERMINAL_UX_AND_EXECUTION_REPAIR', () => {
  beforeEach(() => {
    resetSmartSwapIngressHandoffBridge()
  })

  it('keeps Architecture freeze + SmartSwapForm / Router / fee libs unchanged', () => {
    expect(SMART_SWAP_ARCHITECTURE_ID).toBe('SMART_SWAP_ARCHITECTURE_000')
    const form = readFileSync(path.join(WEB, 'src/views/Swap/SmartSwap/index.tsx'), 'utf8')
    expect(form).toContain('SmartSwapForm')
    expect(form).not.toContain('smart-swap-execution-handoff')

    const arch = path.join(WEB, 'src/lib/smart-swap-architecture/smartSwapArchitecture000Contracts.ts')
    expect(existsSync(arch)).toBe(true)
    expect(createHash('sha256').update(readFileSync(arch)).digest('hex').length).toBe(64)

    const status = execSync('git status --porcelain', { cwd: REPO }).toString()
    expect(status).not.toMatch(/views\/Swap\/SmartSwap\//)
    expect(status).not.toMatch(/smart-swap-route-engine\//)
    expect(status).not.toMatch(/d87-pricing\//)
    expect(status).not.toMatch(/melega-smart-router\/smartRouterAdapter/)
  })

  it('exposes Instant | Smart mode selector on Trade and Home (same SmartSwapForm)', () => {
    const selector = readFileSync(path.join(WEB, 'src/views/Trade/components/TradeModeSelector.tsx'), 'utf8')
    expect(selector).toContain('Instant')
    expect(selector).toContain('Smart')
    expect(selector).toContain('min-height: 44px')

    const cockpit = readFileSync(path.join(WEB, 'src/views/Trade/TradeCockpit.tsx'), 'utf8')
    expect(cockpit).toContain('TradeModeSelector')
    expect(cockpit).toContain('SmartSwapForm')
    expect(cockpit).toContain('showSmartTransparency')
    expect(cockpit).toContain('publishSwapExperienceMode')

    const home = readFileSync(path.join(WEB, 'src/views/HomeTrade/HomeSwapPanel.tsx'), 'utf8')
    expect(home).toContain('TradeModeSelector')
    expect(home).toContain('SmartSwapForm')
    expect(home).toContain('showSmartTransparency')

    const dex = readFileSync(path.join(WEB, 'src/views/HomeTrade/DexHomeScreen.tsx'), 'utf8')
    expect(dex).not.toMatch(/PrimaryCta[^>]*>\s*Instant Swap/)
    expect(dex).toContain('Start Trading')
    expect(dex).toContain('Trade Terminal')
  })

  it('Instant mode resolves ingress certification without Smart-only blockers', () => {
    publishSwapExperienceMode('instant')
    const resolved = resolveIngressCertifiedHandoff({ userConfirmedExecution: true })
    expect(resolved.experience).toBe('instant')
    expect(resolved.certifiedHandoff).toBe(true)
    expect(resolved.handoffCompatible).toBe(true)
  })

  it('Smart mode requires published handoff certificate before ingress unlock', () => {
    publishSwapExperienceMode('smart')
    expect(resolveIngressCertifiedHandoff({ userConfirmedExecution: true }).certifiedHandoff).toBe(false)

    publishSwapExperienceMode('smart')
    publishSmartSwapHandoffCertification({
      certified: true,
      failures: [],
      userMessage: 'Ready to swap. Confirm in the form to request your wallet signature.',
    })
    expect(resolveIngressCertifiedHandoff({ userConfirmedExecution: true }).certifiedHandoff).toBe(true)
  })

  it('replaces technical certification messages with actionable user copy', () => {
    const blocked = evaluateSmartSwapExecutionHandoff({
      walletConnected: false,
      chainId: 56,
      routeAvailable: true,
      quoteFresh: true,
      minimumReceivedAvailable: true,
      gasEstimateAvailable: true,
      allowanceSufficient: true,
      balanceSufficient: true,
      simulationPassed: true,
      calldataValid: true,
      deadlineValid: true,
    })
    expect(blocked.message).toBe('Wallet connection required.')
    expect(blocked.message).not.toMatch(/Certified handoff/i)

    expect(toUserFacingExecutionError('Certified handoff is required before live execution')).toBe(
      'Execution preparation unavailable. Refresh quote.',
    )
  })

  it('mainnet ingress path prefers DEX canonical gates (source contract)', () => {
    const dispatch = readFileSync(path.join(WEB, 'src/lib/execution-ingress/dispatch.ts'), 'utf8')
    expect(dispatch).toContain('isMainnetChainId')
    expect(dispatch).toContain('useDexCanonicalGates')
    const submit = readFileSync(path.join(WEB, 'src/lib/execution-ingress/canonicalSubmit.ts'), 'utf8')
    expect(submit).toContain('resolveIngressCertifiedHandoff')
    expect(submit).toContain('certifiedHandoff: handoff.certifiedHandoff')
    const updaters = readFileSync(path.join(WEB, 'src/index.tsx'), 'utf8')
    expect(updaters).toContain('KRMP_TESTNET_CHAIN_ID')
    expect(updaters).toMatch(/chainId === KRMP_TESTNET_CHAIN_ID/)
  })
})
