/**
 * LB024 — Liquidity Building product surface restoration.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import {
  LIQUIDITY_STUDIO_VIEW_BY_MODE,
  liquidityStudioModeFromView,
} from '../liquidityRuntime/liquidityStudioView'
import { BLOCKED_ACTIVATION_GATES, canSubmitMutatingAction } from '../liquidityBuilding/programStatus'
import { LB_UX } from '../liquidityBuilding/uxCopy'

const HEADER_SRC = readFileSync(
  path.resolve(__dirname, '../components/LiquidityStudioPageHeader.tsx'),
  'utf8',
)
const SCREEN_SRC = readFileSync(path.resolve(__dirname, '../LiquidityStudioScreen.tsx'), 'utf8')
const BUILDER_SRC = readFileSync(
  path.resolve(__dirname, '../components/LiquidityBuilderPanel.tsx'),
  'utf8',
)
const PANEL_SRC = readFileSync(
  path.resolve(__dirname, '../components/LiquidityBuildingPanel.tsx'),
  'utf8',
)
const HOME_SRC = readFileSync(path.resolve(__dirname, '../components/LiquidityStudioHome.tsx'), 'utf8')

describe('LB024 Liquidity Building access', () => {
  it('1. Liquidity Studio renders a visible Liquidity Building navigation item', () => {
    expect(HEADER_SRC).toMatch(/mode:\s*'Liquidity Building'/)
    expect(HEADER_SRC).toMatch(/label:\s*'Liquidity Building'/)
    expect(HEADER_SRC).toMatch(/ls-tab-\$\{/)
  })

  it('2. Selecting Liquidity Building mounts the real product panel', () => {
    expect(SCREEN_SRC).toMatch(/LiquidityBuildingPanel/)
    expect(SCREEN_SRC).toMatch(/activeMode === 'Liquidity Building'|mode === 'Liquidity Building'/)
    expect(SCREEN_SRC).toMatch(/ls-liquidity-building-layout/)
    expect(PANEL_SRC).toMatch(/data-liquidity-building-panel/)
    expect(PANEL_SRC).toMatch(/data-lb016/)
  })

  it('3. Standard liquidity form is titled Explore Liquidity / Add Liquidity path', () => {
    expect(BUILDER_SRC).toMatch(/Explore Liquidity|Add Liquidity|Manage Liquidity/)
    expect(HEADER_SRC).toMatch(/mode:\s*'Add Liquidity'/)
  })

  it('4. No Liquidity Builder / LP Builder product labels for manual liquidity', () => {
    expect(HEADER_SRC).not.toMatch(/Liquidity Builder/)
    expect(BUILDER_SRC).not.toMatch(/Liquidity Builder/)
    expect(BUILDER_SRC).not.toMatch(/LP Builder/)
  })

  it('5. Setup remains accessible while external gates are blocked', () => {
    expect(PANEL_SRC).toMatch(/card\.startSetup/)
    expect(PANEL_SRC).toMatch(/lb-setup-view/)
    expect(LB_UX.startCta).toBe('Set Up Liquidity Building')
  })

  it('6. Production activation stays disabled while activationAuthorized=false', () => {
    const gate = canSubmitMutatingAction({
      walletConnected: true,
      correctChain: true,
      gates: BLOCKED_ACTIVATION_GATES,
    })
    expect(gate.ok).toBe(false)
    expect(BLOCKED_ACTIVATION_GATES.activationAuthorized).toBe(false)
    expect(PANEL_SRC).toMatch(/disabled=\{!card\.mutateGate\.ok\}/)
  })

  it('7. Activation Pending renders truthfully', () => {
    expect(LB_UX.activationPendingBadge).toBe('Activation Pending')
    expect(PANEL_SRC).toMatch(/lb-blocked-banner|lb-review-activation-pending/)
    expect(PANEL_SRC).not.toMatch(/\bKMS\b|\bBC003S\b|\bHSM\b/)
  })

  it('8. Direct Liquidity Building URL/state survives refresh', () => {
    expect(liquidityStudioModeFromView('building')).toBe('Liquidity Building')
    expect(LIQUIDITY_STUDIO_VIEW_BY_MODE['Liquidity Building']).toBe('building')
    expect(liquidityStudioModeFromView('add')).toBe('Add Liquidity')
  })

  it('9. No fake metrics or placeholder addresses in product copy', () => {
    expect(PANEL_SRC).not.toMatch(/0xdead|0x0000000000000000000000000000000000000000/i)
    expect(PANEL_SRC).not.toMatch(/fake APY|mock metrics|simulated earnings/i)
    expect(LB_UX.metricUnavailable).toBe('Unavailable')
  })

  it('10. Mobile navigation can access Liquidity Building (scrollable tab row)', () => {
    expect(HEADER_SRC).toMatch(/overflow-x:\s*auto/)
    expect(HEADER_SRC).toMatch(/Liquidity Building/)
  })

  it('home / positions expose Liquidity Building entry', () => {
    expect(HOME_SRC).toMatch(/ls-cta-liquidity-building|view=building/)
    expect(HOME_SRC).toMatch(/Liquidity Building/)
  })
})
