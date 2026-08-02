/**
 * SMART_SWAP_SWAP_TERMINAL_UX_AND_EXECUTION_REPAIR
 * Updated: single Smart Swap experience (Instant UX decommissioned).
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

  it('keeps Architecture freeze + SmartSwapForm handoff isolation', () => {
    expect(SMART_SWAP_ARCHITECTURE_ID).toBe('SMART_SWAP_ARCHITECTURE_000')
    const form = readFileSync(path.join(WEB, 'src/views/Swap/SmartSwap/index.tsx'), 'utf8')
    expect(form).toContain('SmartSwapForm')
    expect(form).not.toContain('smart-swap-execution-handoff')

    const arch = path.join(WEB, 'src/lib/smart-swap-architecture/smartSwapArchitecture000Contracts.ts')
    expect(existsSync(arch)).toBe(true)
    expect(createHash('sha256').update(readFileSync(arch)).digest('hex').length).toBe(64)

    const status = execSync('git status --porcelain', { cwd: REPO }).toString()
    expect(status).not.toMatch(/smart-swap-route-engine\/(?!__tests__)/)
    expect(status).not.toMatch(/d87-pricing\//)
    expect(status).not.toMatch(/melega-smart-router\/smartRouterAdapter/)
  })

  it('exposes a single Smart Swap experience on Home (no Instant|Smart tabs)', () => {
    const selector = readFileSync(path.join(WEB, 'src/views/Trade/components/TradeModeSelector.tsx'), 'utf8')
    expect(selector).toContain('@deprecated')
    expect(selector).toContain('return null')

    const cockpit = readFileSync(path.join(WEB, 'src/views/Trade/TradeCockpit.tsx'), 'utf8')
    expect(cockpit).toContain('SmartSwapForm')
    expect(cockpit).not.toContain('TradeModeSelector')
    expect(cockpit).toContain('best route across Melega liquidity')

    const home = readFileSync(path.join(WEB, 'src/views/HomeTrade/HomeSwapPanel.tsx'), 'utf8')
    expect(home).not.toContain('TradeModeSelector')
    expect(home).toContain('SmartSwapForm')
    expect(home).toContain('mode="smart"')
    expect(home).toContain('showSmartTransparency')

    const dex = readFileSync(path.join(WEB, 'src/views/HomeTrade/DexHomeScreen.tsx'), 'utf8')
    expect(dex).not.toMatch(/PrimaryCta[^>]*>\s*Instant Swap/)
    expect(dex).not.toContain('Instant Swap')
    expect(dex).toContain('Swap')
  })

  it('legacy Instant mode is coerced to Smart certification path', () => {
    publishSwapExperienceMode('instant')
    const resolved = resolveIngressCertifiedHandoff({ userConfirmedExecution: true })
    expect(resolved.experience).toBe('smart')
    expect(resolved.certifiedHandoff).toBe(false)
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
    expect(blocked.message).toMatch(/Wallet/i)
    expect(toUserFacingExecutionError(blocked.message)).toMatch(/Wallet/i)
  })
})
