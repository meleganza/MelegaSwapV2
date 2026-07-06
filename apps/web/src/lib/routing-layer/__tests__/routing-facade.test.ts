import { describe, expect, it } from 'vitest'
import fs from 'fs'
import path from 'path'

import {
  routeSmartSwapQuote,
  routeV2SwapQuote,
  routeLiquidityInstruction,
  ROUTING_FACADE_MARKER,
} from 'lib/routing-layer/facade'

const ROUTING_LAYER_DIR = path.resolve(__dirname, '..')

function listSourceFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '__tests__') return []
      return listSourceFiles(full)
    }
    if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) return [full]
    return []
  })
}

describe('KAP-006C routing facade', () => {
  it('swap quote path uses routing-layer facade', () => {
    const trade = {
      inputAmount: { currency: { symbol: 'BNB' }, quotient: { toString: () => '1000' } },
      outputAmount: { currency: { symbol: 'MARCO' }, quotient: { toString: () => '500' } },
      route: { routeType: 'V2' },
      tradeType: 0,
    }

    const routed = routeSmartSwapQuote({
      trade: trade as any,
      allowedSlippage: 50,
      recipient: null,
    })

    expect(routed.marker).toBe(ROUTING_FACADE_MARKER)
    expect(routed.quoteOwner).toBe('routing-layer')
    expect(routed.instruction.adapter).toBe('smart-router')
    expect(routed.executionMachine.schema).toBe('melega.execution.v1')
    expect(routed.executionMachine.lifecycle).toBe('instruction_packaged')
  })

  it('V2 swap quote path uses routing-layer facade', () => {
    const routed = routeV2SwapQuote({
      trade: { mock: true },
      allowedSlippage: 100,
      recipient: null,
    })

    expect(routed.marker).toBe(ROUTING_FACADE_MARKER)
    expect(routed.instruction.adapter).toBe('v2-router')
  })

  it('LP instruction path uses routing-layer facade', () => {
    const routed = routeLiquidityInstruction({
      operation: 'mint',
      currencyA: 'BNB',
      currencyB: 'MARCO',
      chainId: 56,
    })

    expect(routed.marker).toBe(ROUTING_FACADE_MARKER)
    expect(routed.quoteOwner).toBe('routing-layer')
    expect(routed.submitsExecution).toBe(false)
  })

  it('routing-layer does not submit execution from facade', () => {
    const violations: string[] = []
    for (const file of listSourceFiles(ROUTING_LAYER_DIR)) {
      const content = fs.readFileSync(file, 'utf8')
      if (content.includes('dispatchExecutionInstruction')) {
        violations.push(path.basename(file))
      }
      if (content.includes('trackExecutionSubmission')) {
        violations.push(`${path.basename(file)}:trackExecutionSubmission`)
      }
    }
    expect(violations).toEqual([])
  })
})
