import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import fs from 'fs'
import path from 'path'

import {
  EXECUTION_INSTRUCTION_SCHEMA_VERSION,
  INSTRUCTION_SOURCE_KERL_PREVIEW,
  SETTLEMENT_FORBIDDEN_FIELDS,
  assertReportDoesNotImplySettlement,
  buildDryRunExecutionEvidence,
  createExecutionId,
} from 'lib/execution-contract'
import type { BridgeExecutionInstruction } from 'lib/execution-layer/types'
import {
  GATEWAY_ERROR_CODES,
  GATEWAY_FORBIDDEN_KERL_IMPORTS,
  GATEWAY_FORBIDDEN_ROUTING_IMPORTS,
  GATEWAY_FORBIDDEN_SETTLEMENT_FIELDS,
  GATEWAY_FORBIDDEN_TREASURY_IMPORTS,
  GATEWAY_OWNERSHIP,
  dryRunExecutionInstruction,
  isExecutionGatewayEnabled,
  resetExecutionGatewayActivation,
  setExecutionGatewayEnabled,
} from 'lib/execution-gateway'
import {
  acceptKerlExecutionInstruction,
  resetInternalIngressActivation,
} from 'lib/execution-ingress'
import { ExecutionTracker } from 'lib/execution-tracker/tracker'
import * as trackExecutionModule from 'lib/execution-tracker/trackExecution'
import {
  createBridgeExecutionInstruction,
  createSmartSwapExecutionInstruction,
  createV2SwapExecutionInstruction,
} from 'lib/routing-layer'

const GATEWAY_DIR = path.resolve(__dirname, '..')
const EXECUTION_LAYER_DIR = path.resolve(__dirname, '../../execution-layer')
const INGRESS_DIR = path.resolve(__dirname, '../../execution-ingress')
const UI_COMMIT_BUTTONS = [
  path.resolve(__dirname, '../../../views/Swap/SmartSwap/components/SmartSwapCommitButton.tsx'),
  path.resolve(__dirname, '../../../views/Swap/components/SwapCommitButton.tsx'),
  path.resolve(__dirname, '../../../views/Bridge/BridgeForm/components/SmartSwapCommitButton.tsx'),
]

function listSourceFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '__tests__') {
        return []
      }
      return listSourceFiles(full)
    }
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

function kerlBridgeInstruction(): BridgeExecutionInstruction {
  const instruction = createBridgeExecutionInstruction({
    pid: 7,
    isNative: false,
    amount: '1000000000000000000',
  })
  return { ...instruction, source: INSTRUCTION_SOURCE_KERL_PREVIEW }
}

describe('KERL execution gateway — activation', () => {
  afterEach(() => {
    resetExecutionGatewayActivation()
    ExecutionTracker.resetForTests()
  })

  it('is inactive by default', () => {
    expect(isExecutionGatewayEnabled()).toBe(false)
  })

  it('rejects dry-run when inactive without mutating tracker', () => {
    const instruction = kerlBridgeInstruction()
    const result = dryRunExecutionInstruction(instruction, { account: '0xabc', chainId: 56 })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(GATEWAY_ERROR_CODES.INACTIVE)
    }

    const tracker = ExecutionTracker.forScope('0xabc', 56)
    expect(tracker.listRecords()).toHaveLength(0)
  })
})

describe('KERL execution gateway — acceptance', () => {
  beforeEach(() => {
    ExecutionTracker.resetForTests()
    setExecutionGatewayEnabled(true)
  })

  afterEach(() => {
    resetExecutionGatewayActivation()
    ExecutionTracker.resetForTests()
  })

  it('accepts valid SmartSwap instructions', () => {
    const trade = {
      inputAmount: { currency: { symbol: 'BNB' }, quotient: { toString: () => '1000' } },
      outputAmount: { currency: { symbol: 'MARCO' }, quotient: { toString: () => '500' } },
      route: { routeType: 'V2' },
      tradeType: 0,
    }
    const instruction = {
      ...createSmartSwapExecutionInstruction({
        trade: trade as any,
        allowedSlippage: 50,
        recipient: null,
      }),
      source: INSTRUCTION_SOURCE_KERL_PREVIEW,
    }

    const result = dryRunExecutionInstruction(instruction, { account: '0xuser', chainId: 56 })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.instructionType).toBe('SmartSwap')
      expect(result.dryRun.executionStatus).toBe('dry_run_completed')
      expect(result.dryRun.executionPerformed).toBe(false)
      expect(result.dryRun.walletInteraction).toBe('none')
      expect(result.dryRun.executionSuppressed).toBe(true)
    }
  })

  it('accepts valid V2Swap and BridgeBurn instructions', () => {
    const v2 = {
      ...createV2SwapExecutionInstruction({ trade: { mock: true }, allowedSlippage: 50, recipient: null }),
      source: INSTRUCTION_SOURCE_KERL_PREVIEW,
    }
    const bridge = kerlBridgeInstruction()

    expect(dryRunExecutionInstruction(v2).ok).toBe(true)
    expect(dryRunExecutionInstruction(bridge).ok).toBe(true)
  })

  it('rejects invalid instructions safely', () => {
    const instruction = kerlBridgeInstruction()
    const broken = { ...instruction, version: '9.9' as typeof instruction.version }

    const result = dryRunExecutionInstruction(broken)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('INGRESS_VALIDATION_FAILED')
    }
  })

  it('rejects unsupported instruction types', () => {
    const unsupported = {
      id: 'liquidity:1',
      correlationId: 'corr:liquidity:1',
      version: EXECUTION_INSTRUCTION_SCHEMA_VERSION,
      source: INSTRUCTION_SOURCE_KERL_PREVIEW,
      domain: 'liquidity',
      adapter: 'stable-swap',
      createdAt: new Date().toISOString(),
    } as unknown as BridgeExecutionInstruction

    const result = dryRunExecutionInstruction(unsupported)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('INGRESS_UNSUPPORTED_TYPE')
    }
  })
})

describe('KERL execution gateway — suppression guarantees', () => {
  beforeEach(() => {
    ExecutionTracker.resetForTests()
    setExecutionGatewayEnabled(true)
  })

  afterEach(() => {
    resetExecutionGatewayActivation()
    resetInternalIngressActivation()
    ExecutionTracker.resetForTests()
    vi.restoreAllMocks()
  })

  it('never reaches adapter dispatch', async () => {
    const dispatchSpy = vi.spyOn(await import('lib/execution-ingress/dispatch'), 'dispatchExecutionInstruction')

    const result = dryRunExecutionInstruction(kerlBridgeInstruction())

    expect(result.ok).toBe(true)
    expect(dispatchSpy).not.toHaveBeenCalled()
    dispatchSpy.mockRestore()
  })

  it('never reaches wallet submission via trackExecutionSubmission', () => {
    const trackSpy = vi.spyOn(trackExecutionModule, 'trackExecutionSubmission')

    const result = dryRunExecutionInstruction(kerlBridgeInstruction(), { account: '0xwallet', chainId: 56 })

    expect(result.ok).toBe(true)
    expect(trackSpy).not.toHaveBeenCalled()

    const tracker = ExecutionTracker.forScope('0xwallet', 56)
    const record = tracker.getByInstructionId(kerlBridgeInstruction().id)
    expect(record?.events.some((e) => e.type === 'wallet_submission_started')).toBe(false)
    expect(record?.events.some((e) => e.type === 'transaction_submitted')).toBe(false)
    expect(record?.events.some((e) => e.type === 'execution_suppressed')).toBe(true)
  })

  it('never creates transaction hash or receipt', () => {
    const result = dryRunExecutionInstruction(kerlBridgeInstruction(), { account: '0x1', chainId: 56 })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.dryRun.transactionHash).toBeNull()
      expect(result.dryRun.receipt).toBeNull()
      expect(result.dryRun.settlement).toBeNull()
      expect(result.report.txHash).toBeUndefined()
      expect(result.report.receiptReference).toBeUndefined()
      expect(result.evidence.txHash).toBeUndefined()
      expect(result.evidence.receipt).toBeUndefined()
    }
  })

  it('never reaches receipt polling lifecycle events', () => {
    dryRunExecutionInstruction(kerlBridgeInstruction(), { account: '0x2', chainId: 56 })

    const tracker = ExecutionTracker.forScope('0x2', 56)
    const record = tracker.getByInstructionId(kerlBridgeInstruction().id)
    const eventTypes = record?.events.map((e) => e.type) ?? []

    expect(eventTypes).not.toContain('receipt_pending')
    expect(eventTypes).not.toContain('receipt_confirmed')
    expect(eventTypes).not.toContain('receipt_failed')
    expect(eventTypes).toContain('dry_run_completed')
    expect(eventTypes).toContain('execution_suppressed')
  })
})

describe('KERL execution gateway — tracker and report', () => {
  beforeEach(() => {
    ExecutionTracker.resetForTests()
    setExecutionGatewayEnabled(true)
  })

  afterEach(() => {
    resetExecutionGatewayActivation()
    ExecutionTracker.resetForTests()
  })

  it('records full dry-run tracker lifecycle', () => {
    const instruction = kerlBridgeInstruction()
    const result = dryRunExecutionInstruction(instruction, { account: '0xtracker', chainId: 56 })

    expect(result.ok).toBe(true)
    const tracker = ExecutionTracker.forScope('0xtracker', 56)
    const record = tracker.getByInstructionId(instruction.id)

    expect(record?.status).toBe('dry_run_completed')
    expect(record?.events.map((e) => e.type)).toEqual([
      'instruction_received',
      'dry_run_validated',
      'execution_suppressed',
      'dry_run_completed',
      'execution_report_finalized',
    ])
    expect(record?.report?.status).toBe('dry_run_completed')
  })

  it('creates deterministic ExecutionReport from instruction identity', () => {
    const instruction = kerlBridgeInstruction()
    const executionId = createExecutionId(instruction.id)

    const evidenceA = buildDryRunExecutionEvidence(instruction, executionId, 56, '2026-07-03T00:00:00.000Z')
    const evidenceB = buildDryRunExecutionEvidence(instruction, executionId, 56, '2026-07-03T00:00:00.000Z')

    expect(evidenceA).toEqual(evidenceB)
    expect(evidenceA.executionId).toBe(executionId)
    expect(evidenceA.instructionId).toBe(instruction.id)
    expect(evidenceA.status).toBe('dry_run_completed')
  })

  it('does not emit settlement fields on reports or evidence', () => {
    const result = dryRunExecutionInstruction(kerlBridgeInstruction())

    expect(result.ok).toBe(true)
    if (result.ok) {
      assertReportDoesNotImplySettlement(result.report)
      for (const field of SETTLEMENT_FORBIDDEN_FIELDS) {
        expect(field in (result.report as Record<string, unknown>)).toBe(false)
        expect(field in (result.evidence as Record<string, unknown>)).toBe(false)
      }
      expect(result.dryRun.settlement).toBeNull()
      expect(result.dryRun.executionSuppressed).toBe(true)
    }
  })
})

describe('KERL execution gateway — ingress integration', () => {
  beforeEach(() => {
    ExecutionTracker.resetForTests()
    setExecutionGatewayEnabled(true)
  })

  afterEach(() => {
    resetExecutionGatewayActivation()
    ExecutionTracker.resetForTests()
  })

  it('acceptKerlExecutionInstruction routes through dry-run gateway', () => {
    const result = acceptKerlExecutionInstruction(kerlBridgeInstruction(), { account: '0xkerl', chainId: 56 })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.dryRun.executionMode).toBe('DRY_RUN_ONLY')
      expect(result.dryRun.executionSuppressed).toBe(true)
    }
  })
})

describe('KERL execution gateway — forbidden boundaries', () => {
  it('does not import routing engines', () => {
    expect(scanForbiddenImports(GATEWAY_DIR, GATEWAY_FORBIDDEN_ROUTING_IMPORTS)).toEqual([])
  })

  it('does not import treasury modules', () => {
    expect(scanForbiddenImports(GATEWAY_DIR, GATEWAY_FORBIDDEN_TREASURY_IMPORTS)).toEqual([])
  })

  it('does not import KERL runtime', () => {
    expect(scanForbiddenImports(GATEWAY_DIR, GATEWAY_FORBIDDEN_KERL_IMPORTS)).toEqual([])
  })

  it('ownership forbids adapter dispatch and settlement emission', () => {
    expect(GATEWAY_OWNERSHIP.mustNeverOwn).toContain('adapter dispatch')
    expect(GATEWAY_OWNERSHIP.mustNeverOwn).toContain('wallet interaction')
    expect(GATEWAY_OWNERSHIP.mustNeverOwn).toContain('settlement events')
    expect(GATEWAY_FORBIDDEN_SETTLEMENT_FIELDS).toContain('settlementEvent')
  })
})

describe('KERL execution gateway — UI isolation', () => {
  it('commit buttons do not import execution gateway', () => {
    for (const file of UI_COMMIT_BUTTONS) {
      const content = fs.readFileSync(file, 'utf8')
      expect(content).not.toContain('execution-gateway')
      expect(content).not.toContain('dryRunExecutionInstruction')
      expect(content).not.toContain('acceptKerlExecutionInstruction')
    }
  })

  it('execution layer remains free of gateway wiring', () => {
    const violations = scanForbiddenImports(EXECUTION_LAYER_DIR, [
      'lib/execution-gateway',
      'dryRunExecutionInstruction',
      'acceptKerlExecutionInstruction',
    ])
    expect(violations).toEqual([])
  })

  it('ingress dispatch path remains separate from gateway dry-run', () => {
    const ingressContent = fs.readFileSync(path.join(INGRESS_DIR, 'dispatch.ts'), 'utf8')
    expect(ingressContent).not.toContain('dryRunExecutionInstruction')
    expect(ingressContent).not.toContain('completeDryRun')
  })
})
