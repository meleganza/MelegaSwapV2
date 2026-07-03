import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import fs from 'fs'
import path from 'path'

import {
  EXECUTION_INSTRUCTION_SCHEMA_VERSION,
  INSTRUCTION_SOURCE_DEX_ROUTING,
  SETTLEMENT_FORBIDDEN_FIELDS,
  assertReportDoesNotImplySettlement,
} from 'lib/execution-contract'
import type { BridgeExecutionInstruction, SwapExecutionInstruction } from 'lib/execution-layer/types'
import { ExecutionTracker } from 'lib/execution-tracker/tracker'
import {
  createBridgeExecutionInstruction,
  createSmartSwapExecutionInstruction,
  createV2SwapExecutionInstruction,
} from 'lib/routing-layer'
import * as executionModes from 'lib/execution-modes'
import {
  INGRESS_ERROR_CODES,
  INGRESS_FORBIDDEN_KERL_IMPORTS,
  INGRESS_FORBIDDEN_ROUTING_IMPORTS,
  INGRESS_FORBIDDEN_SETTLEMENT_FIELDS,
  INGRESS_FORBIDDEN_TREASURY_IMPORTS,
  INGRESS_OWNERSHIP,
  acceptKerlExecutionInstruction,
  dispatchExecutionInstruction,
  isInternalIngressEnabled,
  resetInternalIngressActivation,
  resolveInstructionType,
  setInternalIngressEnabled,
  setExecutionGatewayEnabled,
  resetExecutionGatewayActivation,
  validateExecutionInstruction,
} from 'lib/execution-ingress'

const INGRESS_DIR = path.resolve(__dirname, '..')
const EXECUTION_LAYER_DIR = path.resolve(__dirname, '../../execution-layer')
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

function mockAdapters(overrides: Partial<Parameters<typeof dispatchExecutionInstruction>[1]['adapters']> = {}) {
  return {
    smartSwap: async () => '0xsmart',
    v2Swap: async () => '0xv2',
    bridgeBurn: async () => '0xbridge',
    ...overrides,
  }
}

describe('KERL execution ingress — activation', () => {
  afterEach(() => {
    resetInternalIngressActivation()
    ExecutionTracker.resetForTests()
  })

  it('is inactive by default', () => {
    expect(isInternalIngressEnabled()).toBe(false)
  })

  it('rejects dispatch when inactive without mutating tracker', async () => {
    const instruction = createBridgeExecutionInstruction({ pid: 1, isNative: false, amount: '1' })
    const result = await dispatchExecutionInstruction(instruction, {
      account: '0xabc',
      chainId: 56,
      adapters: mockAdapters(),
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(INGRESS_ERROR_CODES.INACTIVE)
    }

    const tracker = ExecutionTracker.forScope('0xabc', 56)
    expect(tracker.listRecords()).toHaveLength(0)
  })
})

describe('KERL execution ingress — validation', () => {
  it('validates smart swap instructions', () => {
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
    })

    const result = validateExecutionInstruction(instruction)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.instructionType).toBe('SmartSwap')
    }
    expect(resolveInstructionType(instruction)).toBe('SmartSwap')
  })

  it('validates V2 swap instructions', () => {
    const instruction = createV2SwapExecutionInstruction({
      trade: { mock: true },
      allowedSlippage: 100,
      recipient: null,
    })

    const result = validateExecutionInstruction(instruction)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.instructionType).toBe('V2Swap')
    }
  })

  it('validates bridge burn instructions', () => {
    const instruction = createBridgeExecutionInstruction({
      pid: 2,
      isNative: true,
      amount: '1000000000000000000',
    })

    const result = validateExecutionInstruction(instruction)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.instructionType).toBe('BridgeBurn')
    }
  })

  it('rejects unsupported instruction types safely', () => {
    const unsupported = {
      id: 'liquidity:1',
      correlationId: 'corr:liquidity:1',
      version: EXECUTION_INSTRUCTION_SCHEMA_VERSION,
      source: INSTRUCTION_SOURCE_DEX_ROUTING,
      domain: 'liquidity',
      adapter: 'stable-swap',
      createdAt: new Date().toISOString(),
    } as unknown as SwapExecutionInstruction

    const result = validateExecutionInstruction(unsupported)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(INGRESS_ERROR_CODES.UNSUPPORTED_TYPE)
    }
  })

  it('rejects instructions with invalid identity', () => {
    const instruction = createBridgeExecutionInstruction({ pid: 1, isNative: false, amount: '1' })
    const broken = { ...instruction, version: '9.9' as typeof instruction.version }

    const result = validateExecutionInstruction(broken)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(INGRESS_ERROR_CODES.VALIDATION_FAILED)
    }
  })
})

describe('KERL execution ingress — dispatch', () => {
  beforeEach(() => {
    ExecutionTracker.resetForTests()
    setInternalIngressEnabled(true)
  })

  afterEach(() => {
    resetInternalIngressActivation()
    ExecutionTracker.resetForTests()
    vi.restoreAllMocks()
  })

  it('blocks live dispatch when activation gates are not satisfied', async () => {
    const instruction = createBridgeExecutionInstruction({ pid: 1, isNative: false, amount: '1' })

    const result = await dispatchExecutionInstruction(instruction, {
      account: '0xuser',
      chainId: 97,
      certifiedHandoff: true,
      adapters: mockAdapters(),
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(INGRESS_ERROR_CODES.GATES_NOT_SATISFIED)
    }
  })

  it('dispatches SmartSwap through injected adapter when live gates pass (future activation simulation)', async () => {
    vi.spyOn(executionModes, 'evaluateLiveExecutionGates').mockReturnValue({
      allowed: true,
      gates: [],
    })

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
    })

    const smartSwap = vi.fn(async () => '0xsmarthash')
    const result = await dispatchExecutionInstruction(instruction, {
      account: '0xuser',
      chainId: 56,
      adapters: mockAdapters({ smartSwap }),
    })

    expect(result.ok).toBe(true)
    expect(smartSwap).toHaveBeenCalledOnce()

    const tracker = ExecutionTracker.forScope('0xuser', 56)
    const record = tracker.getByInstructionId(instruction.id)
    expect(record?.txHash).toBe('0xsmarthash')
    expect(record?.events.some((event) => event.type === 'instruction_received')).toBe(true)
  })

  it('dispatches V2Swap and BridgeBurn to correct adapters only (future activation simulation)', async () => {
    vi.spyOn(executionModes, 'evaluateLiveExecutionGates').mockReturnValue({
      allowed: true,
      gates: [],
    })

    const v2Instruction = createV2SwapExecutionInstruction({
      trade: { mock: true },
      allowedSlippage: 50,
      recipient: null,
    })
    const bridgeInstruction = createBridgeExecutionInstruction({
      pid: 3,
      isNative: false,
      amount: '42',
    })

    const v2Swap = vi.fn(async () => '0xv2hash')
    const bridgeBurn = vi.fn(async () => '0xbridgehash')

    const v2Result = await dispatchExecutionInstruction(v2Instruction, {
      adapters: mockAdapters({ v2Swap }),
    })
    const bridgeResult = await dispatchExecutionInstruction(bridgeInstruction, {
      adapters: mockAdapters({ bridgeBurn }),
    })

    expect(v2Result.ok).toBe(true)
    expect(bridgeResult.ok).toBe(true)
    expect(v2Swap).toHaveBeenCalledOnce()
    expect(bridgeBurn).toHaveBeenCalledOnce()
  })

  it('returns structured error when adapter submission fails (future activation simulation)', async () => {
    vi.spyOn(executionModes, 'evaluateLiveExecutionGates').mockReturnValue({
      allowed: true,
      gates: [],
    })

    const instruction = createBridgeExecutionInstruction({ pid: 1, isNative: false, amount: '1' })

    const result = await dispatchExecutionInstruction(instruction, {
      adapters: mockAdapters({
        bridgeBurn: async () => {
          throw new Error('wallet rejected')
        },
      }),
    })

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(INGRESS_ERROR_CODES.DISPATCH_FAILED)
    }
  })

  it('does not emit settlement fields on returned reports (future activation simulation)', async () => {
    vi.spyOn(executionModes, 'evaluateLiveExecutionGates').mockReturnValue({
      allowed: true,
      gates: [],
    })

    const instruction = createBridgeExecutionInstruction({ pid: 1, isNative: false, amount: '1' })

    const result = await dispatchExecutionInstruction(instruction, {
      adapters: mockAdapters(),
    })

    if (result.ok && result.report) {
      assertReportDoesNotImplySettlement(result.report)
      for (const field of SETTLEMENT_FORBIDDEN_FIELDS) {
        expect(field in (result.report as Record<string, unknown>)).toBe(false)
      }
    }
  })
})

describe('KERL execution ingress — forbidden boundaries', () => {
  it('does not import routing engines', () => {
    const violations = scanForbiddenImports(INGRESS_DIR, INGRESS_FORBIDDEN_ROUTING_IMPORTS)
    expect(violations).toEqual([])
  })

  it('does not import treasury modules', () => {
    const violations = scanForbiddenImports(INGRESS_DIR, INGRESS_FORBIDDEN_TREASURY_IMPORTS)
    expect(violations).toEqual([])
  })

  it('does not import KERL runtime', () => {
    const violations = scanForbiddenImports(INGRESS_DIR, INGRESS_FORBIDDEN_KERL_IMPORTS)
    expect(violations).toEqual([])
  })

  it('ownership forbids route selection and settlement emission', () => {
    expect(INGRESS_OWNERSHIP.mustNeverOwn).toContain('route selection')
    expect(INGRESS_OWNERSHIP.mustNeverOwn).toContain('settlement events')
    expect(INGRESS_OWNERSHIP.mustNeverOwn).toContain('KERL runtime integration')
    expect(INGRESS_FORBIDDEN_SETTLEMENT_FIELDS).toContain('settlementEvent')
  })
})

describe('KERL execution ingress — kerl gateway entry', () => {
  beforeEach(() => {
    ExecutionTracker.resetForTests()
    setExecutionGatewayEnabled(true)
  })

  afterEach(() => {
    resetExecutionGatewayActivation()
    ExecutionTracker.resetForTests()
  })

  it('acceptKerlExecutionInstruction returns dry-run suppression manifest', () => {
    const instruction = {
      ...createBridgeExecutionInstruction({ pid: 1, isNative: false, amount: '1' }),
      source: 'kerl-preview' as const,
    }

    const result = acceptKerlExecutionInstruction(instruction, { account: '0xkerl', chainId: 56 })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.dryRun.executionStatus).toBe('dry_run_completed')
      expect(result.dryRun.executionPerformed).toBe(false)
    }
  })
})

describe('KERL execution ingress — UI isolation', () => {
  it('existing commit buttons do not import execution ingress', () => {
    for (const file of UI_COMMIT_BUTTONS) {
      const content = fs.readFileSync(file, 'utf8')
      expect(content).not.toContain('execution-ingress')
      expect(content).not.toContain('dispatchExecutionInstruction')
    }
  })

  it('execution layer remains free of ingress wiring', () => {
    const violations = scanForbiddenImports(EXECUTION_LAYER_DIR, ['lib/execution-ingress', 'dispatchExecutionInstruction'])
    expect(violations).toEqual([])
  })
})
