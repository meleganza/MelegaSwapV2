/**
 * SMART_SWAP_MODULE_006 — AI Assistance tests (explanation only).
 */
import { createHash } from 'crypto'
import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { SMART_SWAP_ARCHITECTURE_ID } from 'lib/smart-swap-architecture/smartSwapArchitecture000Contracts'
import {
  SMART_SWAP_AI_ASSISTANCE_OWNERSHIP,
  SMART_SWAP_AI_FAILURES,
  assertSafeAIExplanation,
  buildSmartSwapAIAssistance,
  containsForbiddenAIContent,
} from '../index'

const WEB = path.resolve(__dirname, '../../../../')
const REPO = path.resolve(WEB, '../..')

const FORBIDDEN = [
  'Buy this token.',
  'Sell this token.',
  'This is the best investment.',
  'You should maximize profit.',
  'You should increase your position.',
  'Guaranteed savings.',
  'Guaranteed better price.',
  'Guaranteed outcome.',
]

describe('SMART_SWAP_MODULE_006 AI Assistance', () => {
  it('keeps Architecture freeze + SmartSwapForm / engines unchanged', () => {
    expect(SMART_SWAP_ARCHITECTURE_ID).toBe('SMART_SWAP_ARCHITECTURE_000')

    const form = readFileSync(path.join(WEB, 'src/views/Swap/SmartSwap/index.tsx'), 'utf8')
    expect(form).toContain('SmartSwapForm')
    expect(form).not.toContain('smart-swap-ai-assistance')
    expect(form).not.toContain('SmartSwapAIAssistance')

    const arch = path.join(WEB, 'src/lib/smart-swap-architecture/smartSwapArchitecture000Contracts.ts')
    expect(existsSync(arch)).toBe(true)
    expect(createHash('sha256').update(readFileSync(arch)).digest('hex').length).toBe(64)

    const routeEngine = path.join(WEB, 'src/lib/smart-swap-route-engine/index.ts')
    const preview = path.join(WEB, 'src/lib/smart-swap-execution-preview/index.ts')
    const fee = path.join(WEB, 'src/lib/smart-swap-fee-transparency/index.ts')
    expect(existsSync(routeEngine)).toBe(true)
    expect(existsSync(preview)).toBe(true)
    expect(existsSync(fee)).toBe(true)

    const module = readFileSync(
      path.join(WEB, 'src/views/SmartSwapStudio/modules/SmartSwapExecutionPreview/SmartSwapExecutionPreviewModule.tsx'),
      'utf8',
    )
    expect(module).toContain('SmartSwapAIAssistancePanel')

    const status = execSync('git status --porcelain', { cwd: REPO }).toString()
    expect(status).not.toMatch(/views\/Swap\/SmartSwap\//)
    expect(status).not.toMatch(/smart-swap-route-engine\//)
    expect(status).not.toMatch(/smart-swap-execution-preview\//)
    expect(status).not.toMatch(/smart-swap-fee-transparency\//)
    expect(status).not.toMatch(/d87-pricing\//)
    expect(status).not.toMatch(/treasury-handoff\//)
  })

  it('explains multi-hop routes factually', () => {
    const result = buildSmartSwapAIAssistance({
      preferredType: 'ROUTE_EXPLANATION',
      hopCount: 2,
      pathSymbols: ['USDT', 'BNB', 'MARCO'],
      routeId: 'r1',
    })
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    expect(result.assistance.contextType).toBe('ROUTE_EXPLANATION')
    expect(result.assistance.explanation).toMatch(/two liquidity pools/i)
    expect(result.assistance.explanation).toMatch(/BNB/)
    expect(result.assistance.relatedRoute).toBe('USDT → BNB → MARCO')
    expect(result.assistance.confidence).toBe('HIGH')
    expect(result.optional).toBe(true)
  })

  it('explains high price impact without advice', () => {
    const result = buildSmartSwapAIAssistance({
      preferredType: 'PRICE_IMPACT_EXPLANATION',
      priceImpactPercent: 7.2,
      priceImpactSeverity: 'HIGH',
      liquidityAvailable: false,
    })
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    expect(result.assistance.explanation).toMatch(/Price impact is elevated/)
    expect(result.assistance.explanation.toLowerCase()).not.toContain('buy this')
    expect(result.assistance.explanation.toLowerCase()).not.toContain('guaranteed')
  })

  it('explains fees and liquidity from canonical context', () => {
    const fee = buildSmartSwapAIAssistance({
      preferredType: 'FEE_EXPLANATION',
      feeAvailable: true,
      feeLabel: '30 bps',
    })
    expect(fee.status).toBe('ok')
    if (fee.status === 'ok') {
      expect(fee.assistance.explanation).toMatch(/canonical fee engine/)
    }

    const liq = buildSmartSwapAIAssistance({
      preferredType: 'LIQUIDITY_EXPLANATION',
      liquidityAvailable: false,
    })
    expect(liq.status).toBe('ok')
    if (liq.status === 'ok') {
      expect(liq.assistance.explanation).toMatch(/lower available liquidity/i)
    }
  })

  it('explains no-route errors without blocking execution semantics', () => {
    const result = buildSmartSwapAIAssistance({
      preferredType: 'ERROR_EXPLANATION',
      noRoute: true,
    })
    expect(result.status).toBe('ok')
    if (result.status !== 'ok') return
    expect(result.assistance.explanation).toBe('No route is currently available for this token pair.')
    expect(result.optional).toBe(true)
  })

  it('handles missing data, AI unavailable, and timeout as optional failures', () => {
    expect(buildSmartSwapAIAssistance(null).status).toBe('failure')
    expect(buildSmartSwapAIAssistance({}).status).toBe('failure')

    const unavailable = buildSmartSwapAIAssistance({ forceFailure: 'AI_UNAVAILABLE' })
    expect(unavailable.status).toBe('failure')
    if (unavailable.status === 'failure') {
      expect(unavailable.failure).toBe('AI_UNAVAILABLE')
      expect(unavailable.optional).toBe(true)
      expect(unavailable.message).toMatch(/still continue the swap/)
    }

    const timeout = buildSmartSwapAIAssistance({ timedOut: true })
    expect(timeout.status).toBe('failure')
    if (timeout.status === 'failure') expect(timeout.failure).toBe('TIMEOUT')

    expect([...SMART_SWAP_AI_FAILURES]).toEqual([
      'AI_UNAVAILABLE',
      'CONTEXT_UNAVAILABLE',
      'INSUFFICIENT_DATA',
      'TIMEOUT',
      'PARTIAL_CONTEXT',
    ])
  })

  it('rejects forbidden advisory / guarantee language', () => {
    for (const phrase of FORBIDDEN) {
      expect(containsForbiddenAIContent(phrase)).toBe(true)
      expect(assertSafeAIExplanation(phrase)).toBe('Information unavailable.')
    }
    expect(assertSafeAIExplanation('This route uses two liquidity pools.')).toMatch(/two liquidity pools/)
  })

  it('documents ownership — explanation only', () => {
    expect(SMART_SWAP_AI_ASSISTANCE_OWNERSHIP.owns).toEqual(
      expect.arrayContaining(['explanation', 'education', 'contextual assistance']),
    )
    expect(SMART_SWAP_AI_ASSISTANCE_OWNERSHIP.doesNotOwn).toEqual(
      expect.arrayContaining([
        'route selection',
        'swap execution',
        'fee calculation or mutation',
        'Treasury settlement',
        'KERL attribution',
        'financial advice',
      ]),
    )
    expect(SMART_SWAP_AI_ASSISTANCE_OWNERSHIP.principle).toMatch(/optional/)
  })
})
