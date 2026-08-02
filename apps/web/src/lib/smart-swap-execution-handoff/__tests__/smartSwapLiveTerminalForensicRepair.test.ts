/**
 * SMART_SWAP_LIVE_TERMINAL_FORENSIC_REPAIR
 * Updated: single Smart Swap experience (Instant UX + KERL decommissioned).
 */
import { createHash } from 'crypto'
import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { beforeEach, describe, expect, it } from 'vitest'
import { SMART_SWAP_ARCHITECTURE_ID } from 'lib/smart-swap-architecture/smartSwapArchitecture000Contracts'
import {
  publishSmartSwapHandoffCertification,
  publishSwapExperienceMode,
  resetSmartSwapIngressHandoffBridge,
  resolveIngressCertifiedHandoff,
  readSmartSwapIngressHandoff,
} from '../index'
import { CANONICAL_SWAP_EXPERIENCE, parseSwapExperience } from 'views/Trade/swapExperience'
import { isKerlRoutingAuthorityEnforced } from 'lib/kerl-constitutional/authority'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(WEB, '../..')

describe('SMART_SWAP_LIVE_TERMINAL_FORENSIC_REPAIR', () => {
  beforeEach(() => {
    resetSmartSwapIngressHandoffBridge()
  })

  it('mounts /swap → TradeTerminalScreen → TradeCockpit → SmartSwapForm', () => {
    const swapPage = readFileSync(path.join(WEB, 'src/pages/swap/index.tsx'), 'utf8')
    expect(swapPage).toContain('TradeTerminalScreen')
    expect(swapPage).toContain('SwapFeaturesProvider')

    const cockpit = readFileSync(path.join(WEB, 'src/views/Trade/TradeCockpit.tsx'), 'utf8')
    expect(cockpit).toContain('SmartSwapForm')
    expect(cockpit).not.toContain('TradeModeSelector')
    expect(cockpit).toContain('best route across Melega liquidity')

    const form = readFileSync(path.join(WEB, 'src/views/Swap/SmartSwap/index.tsx'), 'utf8')
    expect(form).toContain('SmartSwapForm')
    expect(form).not.toContain('smart-swap-execution-handoff')
  })

  it('resolves all experience modes to Smart certification path', () => {
    publishSwapExperienceMode('instant')
    publishSmartSwapHandoffCertification({
      certified: false,
      failures: ['INSUFFICIENT_ALLOWANCE'],
      userMessage: 'Token approval required before swapping.',
    })
    expect(readSmartSwapIngressHandoff().experience).toBe('instant')
    const resolved = resolveIngressCertifiedHandoff({ userConfirmedExecution: true })
    expect(resolved.experience).toBe('smart')
    expect(resolved.certifiedHandoff).toBe(false)
  })

  it('defaults experience parse to Smart; Instant maps to Smart', () => {
    expect(CANONICAL_SWAP_EXPERIENCE).toBe('smart')
    expect(parseSwapExperience(null)).toBe('smart')
    expect(parseSwapExperience(undefined)).toBe('smart')
    expect(parseSwapExperience('smart')).toBe('smart')
    expect(parseSwapExperience('instant')).toBe('smart')
  })

  it('Smart transparency stack always mounts route preview surface', () => {
    const mod = readFileSync(
      path.join(WEB, 'src/views/SmartSwapStudio/modules/SmartSwapExecutionPreview/SmartSwapExecutionPreviewModule.tsx'),
      'utf8',
    )
    expect(mod).toContain('TransparencyStack')
    expect(mod).toMatch(/if \(!showSmartTransparency\) return null/)
    expect(mod).toContain('SmartSwapVisualRoute')
    expect(isKerlRoutingAuthorityEnforced(97)).toBe(false)
  })

  it('architecture freeze — Router adapter / economics untouched', () => {
    expect(SMART_SWAP_ARCHITECTURE_ID).toBe('SMART_SWAP_ARCHITECTURE_000')
    const arch = path.join(WEB, 'src/lib/smart-swap-architecture/smartSwapArchitecture000Contracts.ts')
    expect(existsSync(arch)).toBe(true)
    expect(createHash('sha256').update(readFileSync(arch)).digest('hex').length).toBe(64)

    const status = execSync('git status --porcelain', { cwd: REPO }).toString()
    expect(status).not.toMatch(/smart-swap-route-engine\/(?!__tests__)/)
    expect(status).not.toMatch(/d87-pricing\//)
    expect(status).not.toMatch(/melega-smart-router\/smartRouterAdapter/)
  })
})
