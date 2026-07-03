import { describe, expect, it } from 'vitest'
import fs from 'fs'
import path from 'path'

import {
  EXECUTION_CONTRACT_OWNERSHIP,
  EXECUTION_FORBIDDEN_ROUTING_IMPORTS,
  EXECUTION_FORBIDDEN_TREASURY_IMPORTS,
  EXECUTION_INSTRUCTION_SCHEMA_VERSION,
  INSTRUCTION_SOURCE_DEX_ROUTING,
  SETTLEMENT_FORBIDDEN_FIELDS,
  assertEvidenceIntegrity,
  assertReportDoesNotImplySettlement,
  buildExecutionReport,
  classifyExecutionError,
  createExecutionId,
  isValidStatusTransition,
  mapTransactionToExecutionEvidence,
} from 'lib/execution-contract'
import { EXECUTION_LAYER_OWNERSHIP } from 'lib/execution-layer/ownership'
import {
  createSmartSwapExecutionInstruction,
  createV2SwapExecutionInstruction,
  createBridgeExecutionInstruction,
  ROUTING_LAYER_OWNERSHIP,
} from 'lib/routing-layer'

const EXECUTION_LAYER_DIR = path.resolve(__dirname, '../../execution-layer')
const ROUTING_LAYER_DIR = path.resolve(__dirname, '../../routing-layer')

function listSourceFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return listSourceFiles(full)
    if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) return [full]
    return []
  })
}

function scanForbiddenImports(dir: string, forbidden: readonly string[]): string[] {
  const violations: string[] = []
  for (const file of listSourceFiles(dir)) {
    const content = fs.readFileSync(file, 'utf8')
    const importSurface = content
      .split('\n')
      .filter((line) => /^\s*import\s/.test(line) || /\bfrom\s+['"]/.test(line) || /\brequire\s*\(/.test(line))
      .join('\n')

    for (const token of forbidden) {
      if (importSurface.includes(token)) {
        violations.push(`${path.basename(file)} imports ${token}`)
      }
    }
  }
  return violations
}

describe('KERL execution contract — instruction identity', () => {
  it('routing layer stamps version, source, and correlation on smart swap instructions', () => {
    const trade = {
      inputAmount: { currency: { symbol: 'BNB' }, quotient: { toString: () => '1000' } },
      outputAmount: { currency: { symbol: 'MARCO' }, quotient: { toString: () => '500' } },
      route: { routeType: 'V2' },
      tradeType: 0,
    }

    const instruction = createSmartSwapExecutionInstruction({
      trade: trade as any,
      allowedSlippage: 50,
      recipient: null,
      fallbackV2: false,
    })

    expect(instruction.version).toBe(EXECUTION_INSTRUCTION_SCHEMA_VERSION)
    expect(instruction.source).toBe(INSTRUCTION_SOURCE_DEX_ROUTING)
    expect(instruction.correlationId).toContain(`corr:${instruction.id}:`)
    expect(instruction.id).toContain('swap-smart:BNB:MARCO')
  })

  it('routing layer stamps identity on V2 and bridge instructions', () => {
    const v2 = createV2SwapExecutionInstruction({
      trade: { mock: true },
      allowedSlippage: 100,
      recipient: '0xabc',
    })
    const bridge = createBridgeExecutionInstruction({
      pid: 3,
      isNative: true,
      amount: '1000000000000000000',
    })

    expect(v2.version).toBe(EXECUTION_INSTRUCTION_SCHEMA_VERSION)
    expect(v2.source).toBe(INSTRUCTION_SOURCE_DEX_ROUTING)
    expect(v2.correlationId).toContain('corr:')

    expect(bridge.version).toBe(EXECUTION_INSTRUCTION_SCHEMA_VERSION)
    expect(bridge.source).toBe(INSTRUCTION_SOURCE_DEX_ROUTING)
    expect(bridge.adapter).toBe('kronoswap-bridge')
  })
})

describe('KERL execution contract — production boundary', () => {
  it('execution layer does not export instruction factories', () => {
    const indexPath = path.resolve(EXECUTION_LAYER_DIR, 'index.ts')
    const content = fs.readFileSync(indexPath, 'utf8')

    expect(content).not.toContain('createSmartSwapExecutionInstruction')
    expect(content).not.toContain('createV2SwapExecutionInstruction')
    expect(content).not.toContain('createBridgeExecutionInstruction')
    expect(content).not.toContain('createInstructionIdentity')
  })

  it('routing layer owns instruction production', () => {
    expect(ROUTING_LAYER_OWNERSHIP.owns).toContain('execution instruction production (from routing output)')
    expect(EXECUTION_CONTRACT_OWNERSHIP.executionLayerMustNeverOwn).toContain('instruction production')
    expect(EXECUTION_LAYER_OWNERSHIP.mustNeverOwn).toContain('instruction production')
  })

  it('routing layer source files do not import execution hooks', () => {
    const violations = scanForbiddenImports(ROUTING_LAYER_DIR, [
      'useSmartSwapExecution',
      'useV2SwapExecution',
      'useBridgeExecution',
      'useSwapCallback',
      'useBurnToken',
    ])
    expect(violations).toEqual([])
  })
})

describe('KERL execution contract — forbidden imports', () => {
  it('execution layer does not import routing engines', () => {
    const violations = scanForbiddenImports(EXECUTION_LAYER_DIR, EXECUTION_FORBIDDEN_ROUTING_IMPORTS)
    expect(violations).toEqual([])
  })

  it('execution layer does not import treasury modules', () => {
    const violations = scanForbiddenImports(EXECUTION_LAYER_DIR, EXECUTION_FORBIDDEN_TREASURY_IMPORTS)
    expect(violations).toEqual([])
  })
})

describe('KERL execution contract — evidence model', () => {
  it('maps redux transaction to evidence with identity and receipt reference', () => {
    const instruction = createBridgeExecutionInstruction({ pid: 1, isNative: false, amount: '1' })
    const executionId = createExecutionId(instruction.id, 1_700_000_000_000)
    const evidence = mapTransactionToExecutionEvidence(
      instruction,
      {
        hash: '0xhash',
        addedTime: 1_700_000_000_000,
        from: '0xfrom',
        summary: 'Bridge burn',
        receipt: { blockNumber: 42, status: 1 } as any,
      },
      executionId,
      56,
    )

    expect(evidence.instructionId).toBe(instruction.id)
    expect(evidence.correlationId).toBe(instruction.correlationId)
    expect(evidence.instructionVersion).toBe(EXECUTION_INSTRUCTION_SCHEMA_VERSION)
    expect(evidence.instructionSource).toBe(INSTRUCTION_SOURCE_DEX_ROUTING)
    expect(evidence.status).toBe('confirmed')
    expect(evidence.txHash).toBe('0xhash')
    expect(evidence.chainId).toBe(56)
    expect(evidence.receiptReference).toEqual({ txHash: '0xhash', blockNumber: 42, status: 1 })
    expect(evidence.error).toBeUndefined()

    for (const field of SETTLEMENT_FORBIDDEN_FIELDS) {
      expect(evidence).not.toHaveProperty(field)
    }

    expect(() => assertEvidenceIntegrity(evidence)).not.toThrow()
  })

  it('evidence cannot fabricate receipts without transaction hash', () => {
    const instruction = createBridgeExecutionInstruction({ pid: 1, isNative: false, amount: '1' })
    const evidence = mapTransactionToExecutionEvidence(
      instruction,
      { addedTime: Date.now(), from: '0xfrom', summary: 'pending' },
      createExecutionId(instruction.id, 1),
    )

    expect(evidence.receipt).toBeUndefined()
    expect(evidence.receiptReference).toBeUndefined()
    expect(evidence.status).toBe('submitted')

    expect(() =>
      assertEvidenceIntegrity({
        ...evidence,
        receipt: { blockNumber: 1, status: 1 } as any,
      }),
    ).toThrow(/cannot include a receipt without transaction hash/)
  })

  it('classifies reverted transactions as structured execution errors', () => {
    const instruction = createBridgeExecutionInstruction({ pid: 1, isNative: false, amount: '1' })
    const evidence = mapTransactionToExecutionEvidence(
      instruction,
      {
        hash: '0xrevert',
        addedTime: Date.now(),
        from: '0xfrom',
        summary: 'revert',
        receipt: { blockNumber: 7, status: 0 } as any,
      },
      createExecutionId(instruction.id, 2),
    )

    expect(evidence.status).toBe('reverted')
    expect(evidence.error?.category).toBe('reverted')
    expect(evidence.error?.code).toBe('EVM_REVERTED')
  })
})

describe('KERL execution contract — execution report', () => {
  it('builds lifecycle report without settlement fields', () => {
    const instruction = createBridgeExecutionInstruction({ pid: 2, isNative: true, amount: '9' })
    const evidence = mapTransactionToExecutionEvidence(
      instruction,
      {
        hash: '0xabc',
        addedTime: 1_700_000_000_100,
        confirmedTime: 1_700_000_000_500,
        from: '0xfrom',
        summary: 'Bridge',
        receipt: { blockNumber: 99, status: 1 } as any,
      },
      createExecutionId(instruction.id, 3),
      56,
    )

    const report = buildExecutionReport(evidence)

    expect(report.instructionId).toBe(instruction.id)
    expect(report.correlationId).toBe(instruction.correlationId)
    expect(report.txHash).toBe('0xabc')
    expect(report.receiptReference?.txHash).toBe('0xabc')
    expect(report).not.toHaveProperty('receipt')

    for (const field of SETTLEMENT_FORBIDDEN_FIELDS) {
      expect(report).not.toHaveProperty(field)
    }

    expect(() => assertReportDoesNotImplySettlement(report)).not.toThrow()
    expect(() =>
      assertReportDoesNotImplySettlement({
        ...report,
        settlementStatus: 'complete',
      } as any),
    ).toThrow(/must not imply settlement/)
  })
})

describe('KERL execution contract — status lifecycle', () => {
  it('allows valid pre-submit and post-submit transitions', () => {
    expect(isValidStatusTransition('ready', 'submitted')).toBe(true)
    expect(isValidStatusTransition('submitted', 'pending')).toBe(true)
    expect(isValidStatusTransition('pending', 'confirmed')).toBe(true)
  })

  it('rejects settlement-like jumps from terminal states', () => {
    expect(isValidStatusTransition('confirmed', 'submitted')).toBe(false)
    expect(isValidStatusTransition('reverted', 'confirmed')).toBe(false)
  })
})

describe('KERL execution contract — error model', () => {
  it('classifies wallet rejection separately from unknown failures', () => {
    const wallet = classifyExecutionError('User rejected the request')
    const unknown = classifyExecutionError('Something broke', 'failed')

    expect(wallet?.category).toBe('wallet_rejected')
    expect(unknown?.category).toBe('adapter_error')
  })
})

describe('KERL execution boundary — regression contract', () => {
  it('preserves adapter dispatch mapping for swap paths', () => {
    const trade = {
      inputAmount: { currency: { symbol: 'BNB' }, quotient: { toString: () => '1' } },
      outputAmount: { currency: { symbol: 'MARCO' }, quotient: { toString: () => '2' } },
      route: { routeType: 'V2' },
    }
    expect(
      createSmartSwapExecutionInstruction({ trade: trade as any, allowedSlippage: 50, recipient: null }).adapter,
    ).toBe('smart-router')
    expect(
      createV2SwapExecutionInstruction({ trade: {}, allowedSlippage: 50, recipient: null }).adapter,
    ).toBe('v2-router')
  })

  it('keeps smart-execution illustrative module outside boundary wiring', () => {
    const smartExecutionIndex = path.resolve(__dirname, '../../smart-execution/index.ts')
    const content = fs.readFileSync(smartExecutionIndex, 'utf8')
    expect(content).not.toContain('execution-layer')
    expect(content).not.toContain('routing-layer')
    expect(content).not.toContain('execution-contract')
  })

  it('documents routing ownership separately from execution', () => {
    expect(ROUTING_LAYER_OWNERSHIP.owns).toContain('route discovery')
    expect(ROUTING_LAYER_OWNERSHIP.mustNeverOwn).toContain('wallet transaction submission')
    expect(EXECUTION_LAYER_OWNERSHIP.owns).toContain('transaction submission')
    expect(EXECUTION_LAYER_OWNERSHIP.mustNeverOwn).toContain('route selection')
  })
})
