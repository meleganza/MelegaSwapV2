/**
 * SMART_SWAP_LIVE_TERMINAL_FORENSIC_REPAIR
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
import { parseSwapExperience } from 'views/Trade/swapExperience'

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
    expect(cockpit).toContain('TradeModeSelector')
    expect(cockpit).toContain('SmartSwapForm')
    expect(cockpit).toContain('data-trade-mode-selector-slot')
    expect(cockpit).toContain('showSmartTransparency')

    const form = readFileSync(path.join(WEB, 'src/views/Swap/SmartSwap/index.tsx'), 'utf8')
    expect(form).toContain('SmartSwapForm')
    expect(form).not.toContain('smart-swap-execution-handoff')
  })

  it('keeps Instant experience when Smart handoff publishes without forcing mode', () => {
    publishSwapExperienceMode('instant')
    publishSmartSwapHandoffCertification({
      certified: false,
      failures: ['INSUFFICIENT_ALLOWANCE'],
      userMessage: 'Token approval required before swapping.',
    })
    expect(readSmartSwapIngressHandoff().experience).toBe('instant')
    const resolved = resolveIngressCertifiedHandoff({ userConfirmedExecution: true })
    expect(resolved.experience).toBe('instant')
    expect(resolved.certifiedHandoff).toBe(true)
  })

  it('defaults /swap experience to Instant; Smart is opt-in', () => {
    expect(parseSwapExperience(null)).toBe('instant')
    expect(parseSwapExperience(undefined)).toBe('instant')
    expect(parseSwapExperience('smart')).toBe('smart')
    expect(parseSwapExperience('instant')).toBe('instant')
  })

  it('does not mount Smart handoff hooks while Instant (module early-return child pattern)', () => {
    const mod = readFileSync(
      path.join(WEB, 'src/views/SmartSwapStudio/modules/SmartSwapExecutionPreview/SmartSwapExecutionPreviewModule.tsx'),
      'utf8',
    )
    expect(mod).toContain('SmartTransparencyStack')
    expect(mod).toMatch(/if \(!showSmartTransparency\) return null/)
    expect(mod).toContain('return <SmartTransparencyStack />')
    // Hooks must not run for Instant — child only mounts when Smart
    const earlyIdx = mod.indexOf('if (!showSmartTransparency) return null')
    const stackIdx = mod.indexOf('function SmartTransparencyStack')
    expect(earlyIdx).toBeGreaterThan(-1)
    expect(stackIdx).toBeGreaterThan(-1)
  })

  it('mainnet / non-testnet uses DEX canonical gates; chain 97 keeps live gates', () => {
    const dispatch = readFileSync(path.join(WEB, 'src/lib/execution-ingress/dispatch.ts'), 'utf8')
    expect(dispatch).toContain('isTestnetChainId')
    expect(dispatch).toContain('isMainnetChainId')
    expect(dispatch).toContain('!isTestnetChainId(chainId)')
    expect(dispatch).toContain('useDexCanonicalGates')

    const updaters = readFileSync(path.join(WEB, 'src/index.tsx'), 'utf8')
    expect(updaters).toMatch(/chainId === KRMP_TESTNET_CHAIN_ID/)
  })

  it('mode selector CSS cannot hide Instant|Smart tabs on /swap', () => {
    const style = readFileSync(path.join(WEB, 'src/views/Trade/TradeTerminalGlobalStyle.tsx'), 'utf8')
    expect(style).toContain('[data-trade-mode-selector]')
    expect(style).toContain('flex-shrink: 0 !important')
    expect(style).toContain("button[role='tab']")
    const selector = readFileSync(path.join(WEB, 'src/views/Trade/components/TradeModeSelector.tsx'), 'utf8')
    expect(selector).toContain('flex-shrink: 0')
    expect(selector).toContain('min-height: 44px')
  })

  it('architecture freeze — SmartSwapForm / Router / economics untouched', () => {
    expect(SMART_SWAP_ARCHITECTURE_ID).toBe('SMART_SWAP_ARCHITECTURE_000')
    const arch = path.join(WEB, 'src/lib/smart-swap-architecture/smartSwapArchitecture000Contracts.ts')
    expect(existsSync(arch)).toBe(true)
    expect(createHash('sha256').update(readFileSync(arch)).digest('hex').length).toBe(64)

    const status = execSync('git status --porcelain', { cwd: REPO }).toString()
    expect(status).not.toMatch(/views\/Swap\/SmartSwap\//)
    expect(status).not.toMatch(/smart-swap-route-engine\//)
    expect(status).not.toMatch(/d87-pricing\//)
    expect(status).not.toMatch(/melega-smart-router\/smartRouterAdapter/)
  })
})
