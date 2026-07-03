import { describe, expect, it, beforeEach } from 'vitest'
import fs from 'fs'
import path from 'path'

import {
  EXECUTION_INSTRUCTION_SCHEMA_VERSION,
  INSTRUCTION_SOURCE_DEX_ROUTING,
  isValidStatusTransition,
} from 'lib/execution-contract'
import type { BridgeExecutionInstruction } from 'lib/execution-layer/types'
import {
  EXECUTION_TRACKER_OWNERSHIP,
  TRACKER_FORBIDDEN_ROUTING_IMPORTS,
  TRACKER_FORBIDDEN_SETTLEMENT_FIELDS,
  TRACKER_FORBIDDEN_TREASURY_IMPORTS,
} from 'lib/execution-tracker/ownership'
import { ExecutionTracker, getExecutionTracker } from 'lib/execution-tracker/tracker'

const TRACKER_DIR = path.resolve(__dirname, '..')

function buildTestBridgeInstruction(overrides: Partial<BridgeExecutionInstruction> = {}): BridgeExecutionInstruction {
  return {
    id: 'bridge:1:1:erc20',
    correlationId: 'corr:bridge:1:1:erc20:123',
    version: EXECUTION_INSTRUCTION_SCHEMA_VERSION,
    source: INSTRUCTION_SOURCE_DEX_ROUTING,
    domain: 'bridge',
    adapter: 'kronoswap-bridge',
    createdAt: new Date().toISOString(),
    routingPlan: {
      domain: 'bridge',
      pid: 1,
      isNative: false,
      amount: '1',
    },
    pid: 1,
    isNative: false,
    amount: '1',
    ...overrides,
  }
}

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

describe('KERL execution tracker — lifecycle', () => {
  beforeEach(() => {
    ExecutionTracker.resetForTests()
  })

  it('records instruction through hash capture without fabricating receipt', () => {
    const instruction = buildTestBridgeInstruction()
    const tracker = getExecutionTracker()

    const executionId = tracker.registerInstruction(instruction)
    tracker.markWalletSubmissionStarted(executionId)
    tracker.markTransactionSubmitted(executionId)
    tracker.captureTransactionHash(executionId, '0xabc', 56)

    const record = tracker.getRecord(executionId)
    expect(record?.instructionId).toBe(instruction.id)
    expect(record?.correlationId).toBe(instruction.correlationId)
    expect(record?.txHash).toBe('0xabc')
    expect(record?.status).toBe('pending')
    expect(record?.receiptReference).toBeUndefined()
    expect(record?.events.map((event) => event.type)).toEqual([
      'instruction_received',
      'wallet_submission_started',
      'transaction_submitted',
      'transaction_hash_captured',
      'receipt_pending',
    ])
  })

  it('correlates instruction id to transaction hash when available', () => {
    const instruction = buildTestBridgeInstruction({
      id: 'bridge:2:9:native',
      correlationId: 'corr:bridge:2:9:native:456',
      pid: 2,
      isNative: true,
      amount: '9',
    })
    const tracker = getExecutionTracker()
    const executionId = tracker.registerInstruction(instruction)
    tracker.markWalletSubmissionStarted(executionId)
    tracker.markTransactionSubmitted(executionId)
    tracker.captureTransactionHash(executionId, '0xhash', 56)

    expect(tracker.getByInstructionId(instruction.id)?.txHash).toBe('0xhash')
    expect(tracker.getByTxHash('0xhash')?.instructionId).toBe(instruction.id)
  })

  it('syncs receipt reference only when redux transaction provides receipt', () => {
    const instruction = buildTestBridgeInstruction()
    const tracker = getExecutionTracker()
    const executionId = tracker.registerInstruction(instruction)
    tracker.captureTransactionHash(executionId, '0xconfirmed', 56)

    tracker.syncReceiptFromTransaction(
      executionId,
      instruction,
      {
        hash: '0xconfirmed',
        addedTime: Date.now(),
        from: '0xfrom',
        summary: 'swap',
        receipt: { blockNumber: 12, status: 1 } as any,
      },
      56,
    )

    const record = tracker.getRecord(executionId)
    expect(record?.status).toBe('confirmed')
    expect(record?.receiptReference).toEqual({ txHash: '0xconfirmed', blockNumber: 12, status: 1 })
    expect(record?.report).toBeDefined()
    expect(record?.events.at(-1)?.type).toBe('execution_report_finalized')
  })

  it('preserves unknown receipt state when transaction has hash only', () => {
    const instruction = buildTestBridgeInstruction()
    const tracker = getExecutionTracker()
    const executionId = tracker.registerInstruction(instruction)
    tracker.captureTransactionHash(executionId, '0xpending', 56)

    tracker.syncReceiptFromTransaction(
      executionId,
      instruction,
      {
        hash: '0xpending',
        addedTime: Date.now(),
        from: '0xfrom',
        summary: 'pending',
      },
      56,
    )

    const record = tracker.getRecord(executionId)
    expect(record?.status).toBe('pending')
    expect(record?.receiptReference).toEqual({ txHash: '0xpending' })
    expect(record?.report).toBeUndefined()
  })

  it('cannot fabricate receipts without transaction hash', () => {
    const instruction = buildTestBridgeInstruction()
    const tracker = getExecutionTracker()

    expect(() => tracker.captureTransactionHash('missing', '', 56)).toThrow()
    expect(() => {
      const executionId = tracker.registerInstruction(instruction)
      tracker.syncReceiptFromTransaction(
        executionId,
        instruction,
        { addedTime: Date.now(), from: '0xfrom', summary: 'no hash' },
        56,
      )
    }).not.toThrow()
  })

  it('finalizes execution report without settlement fields', () => {
    const instruction = buildTestBridgeInstruction()
    const tracker = getExecutionTracker()
    const executionId = tracker.registerInstruction(instruction)
    tracker.captureTransactionHash(executionId, '0xfinal', 56)
    tracker.syncReceiptFromTransaction(
      executionId,
      instruction,
      {
        hash: '0xfinal',
        addedTime: Date.now(),
        from: '0xfrom',
        summary: 'done',
        receipt: { blockNumber: 1, status: 0 } as any,
      },
      56,
    )

    const report = tracker.getExecutionReport(executionId)
    expect(report?.status).toBe('reverted')
    for (const field of TRACKER_FORBIDDEN_SETTLEMENT_FIELDS) {
      expect(report).not.toHaveProperty(field)
    }
    expect(report).not.toHaveProperty('receipt')
  })

  it('obeys Phase 3 status lifecycle transitions', () => {
    expect(isValidStatusTransition('ready', 'submitted')).toBe(true)
    expect(isValidStatusTransition('submitted', 'pending')).toBe(true)
    expect(isValidStatusTransition('pending', 'confirmed')).toBe(true)
    expect(isValidStatusTransition('confirmed', 'pending')).toBe(false)
  })
})

describe('KERL execution tracker — forbidden boundaries', () => {
  it('does not import routing engines', () => {
    expect(scanForbiddenImports(TRACKER_DIR, TRACKER_FORBIDDEN_ROUTING_IMPORTS)).toEqual([])
  })

  it('does not import treasury modules', () => {
    expect(scanForbiddenImports(TRACKER_DIR, TRACKER_FORBIDDEN_TREASURY_IMPORTS)).toEqual([])
  })

  it('cannot create settlement events on tracker records', () => {
    const instruction = buildTestBridgeInstruction({ id: 'bridge:7:100:erc20', amount: '100' })

    const tracker = getExecutionTracker()
    const executionId = tracker.registerInstruction(instruction)
    const record = tracker.getRecord(executionId)

    expect(record?.instructionVersion).toBe(EXECUTION_INSTRUCTION_SCHEMA_VERSION)
    expect(record?.instructionSource).toBe(INSTRUCTION_SOURCE_DEX_ROUTING)
    expect(EXECUTION_TRACKER_OWNERSHIP.mustNeverOwn).toContain('settlement events')

    for (const field of TRACKER_FORBIDDEN_SETTLEMENT_FIELDS) {
      expect(record).not.toHaveProperty(field)
    }
  })
})
