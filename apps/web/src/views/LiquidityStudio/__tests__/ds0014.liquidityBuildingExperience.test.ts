/**
 * DS001.4 — Liquidity Building product experience source + domain guards.
 */
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  BLOCKED_ACTIVATION_GATES,
  EMPTY_SETUP_DRAFT,
  canSubmitMutatingAction,
  setupDraftReadyForReview,
} from '../liquidityBuilding/programStatus'
import {
  DECISION_FREQUENCY_OPTIONS,
  LB_UX,
} from '../liquidityBuilding/uxCopy'
import {
  buildingHref,
  phaseToStep,
  showProductStepper,
  stepFromQuery,
  stepToPhase,
  stepperIndexForPhase,
} from '../liquidityBuilding/liquidityBuildingStep'

const ROOT = path.resolve(__dirname, '..')
const PANEL = readFileSync(path.join(ROOT, 'components/LiquidityBuildingPanel.tsx'), 'utf8')
const INTRO = readFileSync(path.join(ROOT, 'liquidityBuilding/product/LbIntroView.tsx'), 'utf8')
const SETUP = readFileSync(path.join(ROOT, 'liquidityBuilding/product/LbSetupView.tsx'), 'utf8')
const REVIEW = readFileSync(path.join(ROOT, 'liquidityBuilding/product/LbReviewView.tsx'), 'utf8')
const PENDING = readFileSync(
  path.join(ROOT, 'liquidityBuilding/product/LbActivationPendingView.tsx'),
  'utf8',
)
const DASH = readFileSync(path.join(ROOT, 'liquidityBuilding/product/LbDashboardView.tsx'), 'utf8')
const MANAGE = readFileSync(path.join(ROOT, 'liquidityBuilding/product/LbManageView.tsx'), 'utf8')
const HOOK = readFileSync(path.join(ROOT, 'liquidityBuilding/useLiquidityBuildingCard.ts'), 'utf8')
const READY = readFileSync(path.join(ROOT, 'liquidityBuilding/useActivationReadiness.ts'), 'utf8')
const SCREEN = readFileSync(path.join(ROOT, 'LiquidityStudioScreen.tsx'), 'utf8')
const HOME = readFileSync(path.join(ROOT, 'components/LiquidityStudioHome.tsx'), 'utf8')
const HEADER = readFileSync(path.join(ROOT, '../../app-shell/MelegaAppShell.tsx'), 'utf8')
const DS0012 = readFileSync(path.join(ROOT, '../../app-shell/__tests__/ds0012.globalHeader.test.ts'), 'utf8')

const FORBIDDEN = [
  /\bEpoch\b/,
  /\bAuthorizer\b/,
  /\bKMS\b/,
  /\bHSM\b/,
  /\bBC003S\b/,
  /\bLB-G03B\b/,
  /\bLB-G11\b/,
  /\bFee Sink\b/,
  /\bTreasury Runtime\b/,
  /Eligible Net Buy Flow/,
]

describe('DS001.4 Liquidity Building experience', () => {
  it('1. view=building mounts the Liquidity Building product surface', () => {
    const card = readFileSync(path.join(ROOT, 'onePage/LiquidityBuildingCard.tsx'), 'utf8')
    const page = readFileSync(path.join(ROOT, 'onePage/UnifiedLiquidityPage.tsx'), 'utf8')
    expect(SCREEN).toMatch(/UnifiedLiquidityPage/)
    expect(card).toMatch(/LiquidityBuildingPanel/)
    expect(page).toMatch(/building/)
    expect(PANEL).toMatch(/data-liquidity-building-panel/)
    expect(PANEL).toMatch(/data-ds0014/)
  })

  it('2. Intro is the no-program entry surface', () => {
    expect(PANEL).toMatch(/LbIntroView/)
    expect(INTRO).toMatch(/Build lasting liquidity from your token reserve/)
    expect(INTRO).toMatch(/Set Up Liquidity Building/)
  })

  it('3. Intro CTA opens Setup via startSetup', () => {
    expect(PANEL).toMatch(/onStartSetup=\{card\.startSetup\}/)
    expect(HOOK).toMatch(/startSetup:\s*\(\)\s*=>\s*\{[\s\S]*setPhase\('setup'\)/)
  })

  it('4. Setup requires a real supported token before review', () => {
    expect(setupDraftReadyForReview(EMPTY_SETUP_DRAFT)).toBe(false)
    expect(
      setupDraftReadyForReview({
        ...EMPTY_SETUP_DRAFT,
        tokenAddress: '0xabc',
        tokenSymbol: 'TKN',
        tokenBudget: '10',
      }),
    ).toBe(true)
    expect(SETUP).toMatch(/Select a supported token/)
    expect(SETUP).toMatch(/CurrencySearchModal|onPickToken|lb-token-select/)
  })

  it('5. Budget validation uses wallet balance and positive budget', () => {
    expect(SETUP).toMatch(/Budget exceeds your available balance/)
    expect(SETUP).toMatch(/Enter a budget greater than zero/)
    expect(SETUP).toMatch(/lb-budget-max/)
  })

  it('6. Full AI is the default strategy', () => {
    expect(EMPTY_SETUP_DRAFT.strategy).toBe('FULL_AI')
    expect(SETUP).toMatch(/RECOMMENDED/)
    expect(SETUP).toMatch(/lb-strategy-full-ai/)
  })

  it('7. Dynamic Range fields appear only when selected', () => {
    expect(SETUP).toMatch(/lb-dynamic-range-fields/)
    expect(SETUP).toMatch(/card\.draft\.strategy === 'DYNAMIC_RANGE'/)
  })

  it('8. Decision Frequency uses only supported values', () => {
    expect(DECISION_FREQUENCY_OPTIONS.map((o) => o.seconds)).toEqual([300, 900, 1800, 3600])
    expect(DECISION_FREQUENCY_OPTIONS.map((o) => o.label)).toEqual([
      '5 minutes',
      '15 minutes',
      '30 minutes',
      '1 hour',
    ])
  })

  it('9. User-facing product surfaces never show Epoch', () => {
    for (const src of [INTRO, SETUP, REVIEW, PENDING, DASH, MANAGE, PANEL]) {
      expect(src).not.toMatch(/\bEpoch\b/)
    }
  })

  it('10. Review shows configured values', () => {
    expect(REVIEW).toMatch(/card\.draft\.tokenSymbol/)
    expect(REVIEW).toMatch(/card\.draft\.tokenBudget/)
    expect(REVIEW).toMatch(/Decision Frequency/)
    expect(REVIEW).toMatch(/Destination Pair/)
  })

  it('11. Review readiness uses the real activation-status source', () => {
    expect(REVIEW).toMatch(/card\.readiness/)
    expect(READY).toMatch(/\/api\/liquidity-building\/activation-status/)
  })

  it('12. Approval/deposit/activation stay disabled when gates are blocked', () => {
    const gate = canSubmitMutatingAction({
      walletConnected: true,
      correctChain: true,
      gates: BLOCKED_ACTIVATION_GATES,
    })
    expect(gate.ok).toBe(false)
    expect(PANEL).toMatch(/disabled=\{!card\.mutateGate\.ok\}/)
    expect(REVIEW).toMatch(/Activation Pending/)
  })

  it('13. Activation Pending is a complete screen', () => {
    expect(PANEL).toMatch(/LbActivationPendingView/)
    expect(PENDING).toMatch(/Activation Pending/)
    expect(PENDING).toMatch(/What happens next/)
    expect(PENDING).toMatch(/Refresh Status/)
    expect(PENDING).toMatch(/lb-blocked-banner/)
  })

  it('14. Refresh Status calls the real readiness endpoint', () => {
    expect(PENDING).toMatch(/card\.readiness\.refresh/)
    expect(READY).toMatch(/refresh:\s*\(\)\s*=>\s*Promise<void>/)
    expect(READY).toMatch(/fetch\('\/api\/liquidity-building\/activation-status'/)
  })

  it('15. Active Dashboard renders only for real active program phase', () => {
    expect(PANEL).toMatch(/card\.phase === 'active' \? <LbDashboardView/)
    expect(HOOK).toMatch(/programRead\.source !== 'ON_CHAIN'/)
  })

  it('16. Dashboard metrics use real program data or em dash', () => {
    expect(DASH).toMatch(/—/)
    expect(DASH).toMatch(/card\.metrics|programSnapshot/)
    expect(DASH).not.toMatch(/fake APY|mock metrics|0xdead/i)
  })

  it('17. No fake chart data renders', () => {
    expect(DASH).toMatch(/card\.liquiditySeries/)
    expect(DASH).toMatch(/No completed Liquidity Building executions yet/)
    expect(HOOK).toMatch(/seriesFromActivity/)
    expect(HOOK).not.toMatch(/Math\.random\(\)|mockCurve|fakeSeries/)
  })

  it('18. Manage shows only real supported controls', () => {
    expect(MANAGE).toMatch(/lb-manage-panel/)
    expect(MANAGE).toMatch(/canMutate/)
    expect(MANAGE).toMatch(/Funds currently assigned to an in-flight execution cannot be withdrawn/)
  })

  it('19. Immutable fields cannot be edited', () => {
    expect(MANAGE).toMatch(/Fixed after activation/)
    expect(MANAGE).toMatch(/disabled data-testid="lb-manage-CHANGE_STRATEGY"/)
  })

  it('20. In-flight funds are not withdrawable', () => {
    expect(MANAGE).toMatch(/cannot be withdrawn/)
    expect(MANAGE).not.toMatch(/Withdraw Budget/)
  })

  it('21. Pause/resume/stop require valid mutating state', () => {
    expect(HOOK).toMatch(/if \(!mutateGate\.ok \|\| programRead\.source !== 'ON_CHAIN'\) return/)
    expect(MANAGE).toMatch(/LbConfirmDialog/)
  })

  it('22. Browser refresh preserves building state via step query', () => {
    expect(HOOK).toMatch(/stepFromQuery\(router\.query\.step\)/)
    expect(HOOK).toMatch(/router\.replace/)
    expect(phaseToStep('setup')).toBe('setup')
    expect(stepToPhase('dashboard')).toBe('active')
    expect(buildingHref('setup')).toBe('/liquidity-studio?view=building&step=setup')
  })

  it('23. Browser back navigates between product steps', () => {
    expect(stepFromQuery('review')).toBe('review')
    expect(stepToPhase('intro')).toBe('entry')
    expect(stepperIndexForPhase('setup')).toBe(0)
    expect(stepperIndexForPhase('review')).toBe(1)
    expect(showProductStepper('status')).toBe(true)
    expect(showProductStepper('active')).toBe(false)
  })

  it('24. No forbidden internal jargon in user-facing UI sources', () => {
    for (const src of [INTRO, SETUP, REVIEW, PENDING, DASH, MANAGE, PANEL]) {
      for (const re of FORBIDDEN) {
        expect(src).not.toMatch(re)
      }
    }
  })

  it('25. No placeholder addresses render', () => {
    for (const src of [INTRO, SETUP, REVIEW, PENDING, DASH, MANAGE, PANEL]) {
      expect(src).not.toMatch(/0xdead|0x0000000000000000000000000000000000000000/i)
    }
  })

  it('26. No fake transactions or fake success toasts', () => {
    expect(HOOK).toMatch(/never fabricate ACTIVE|Fail-closed|programRead\.source !== 'ON_CHAIN'/)
    expect(PANEL).not.toMatch(/toast\(|useToast/)
    expect(MANAGE).not.toMatch(/success toast|fake success/i)
  })

  it('27. Responsive containers avoid root overflow patterns', () => {
    expect(PANEL).toMatch(/max-width:\s*1180px/)
    expect(PANEL).toMatch(/min-width:\s*0/)
    expect(SCREEN).toMatch(/overflow-x:\s*hidden/)
  })

  it('28. DS001.1–DS001.3 surfaces remain present', () => {
    expect(existsSync(path.join(ROOT, '../../design-system/melega/tokens/__tests__/ds001Foundation.test.ts'))).toBe(
      true,
    )
    expect(DS0012.length).toBeGreaterThan(100)
    expect(HEADER).toMatch(/MelegaAppShell|header|72/)
    expect(HOME).toMatch(/data-testid="ls-cta-liquidity-building"/)
    expect(HOME).toMatch(/Add Liquidity/)
    expect(LB_UX.productName).toBe('Liquidity Building')
  })
})
