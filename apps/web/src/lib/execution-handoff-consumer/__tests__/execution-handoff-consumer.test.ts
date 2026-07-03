import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import fs from 'fs'
import path from 'path'

import {
  INSTRUCTION_SOURCE_KERL_PREVIEW,
  SETTLEMENT_FORBIDDEN_FIELDS,
  assertReportDoesNotImplySettlement,
} from 'lib/execution-contract'
import type { BridgeExecutionInstruction } from 'lib/execution-layer/types'
import {
  HANDOFF_CONSUMER_OWNERSHIP,
  HANDOFF_ERROR_CODES,
  HANDOFF_FORBIDDEN_DISPATCH_IMPORTS,
  HANDOFF_FORBIDDEN_KERL_RUNTIME_IMPORTS,
  HANDOFF_FORBIDDEN_TREASURY_IMPORTS,
  HANDOFF_FORBIDDEN_UI_IMPORTS,
  HANDOFF_PACKAGE_VERSION,
  consumeKerlDryRunHandoffPackage,
  validateDryRunHandoffPackage,
  type DryRunHandoffPackage,
} from 'lib/execution-handoff-consumer'
import {
  setExecutionGatewayEnabled,
  resetExecutionGatewayActivation,
} from 'lib/execution-gateway'
import * as kerlGatewayModule from 'lib/execution-ingress/kerl-gateway'
import { resetInternalIngressActivation } from 'lib/execution-ingress'
import { ExecutionTracker } from 'lib/execution-tracker/tracker'
import * as trackExecutionModule from 'lib/execution-tracker/trackExecution'
import { createBridgeExecutionInstruction } from 'lib/routing-layer'

const CONSUMER_DIR = path.resolve(__dirname, '..')
const PAGES_DIR = path.resolve(__dirname, '../../../pages')
const VIEWS_DIR = path.resolve(__dirname, '../../../views')
const API_DIR = path.resolve(__dirname, '../../../pages/api')

const UI_COMMIT_BUTTONS = [
  path.resolve(__dirname, '../../../views/Swap/SmartSwap/components/SmartSwapCommitButton.tsx'),
  path.resolve(__dirname, '../../../views/Swap/components/SwapCommitButton.tsx'),
  path.resolve(__dirname, '../../../views/Bridge/BridgeForm/components/SmartSwapCommitButton.tsx'),
]

function listSourceFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  return entries.flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === 'node_modules') return []
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
      .filter((line) => /^\s*import\s/.test(line) || /\bfrom\s+['"]/.test(line))
      .join('\n')
    for (const token of forbidden) {
      if (importSurface.includes(token)) {
        violations.push(`${path.basename(file)} imports ${token}`)
      }
    }
  }
  return violations
}

function scanSurfaceImports(surfaceDir: string, importToken: string): string[] {
  const hits: string[] = []
  for (const file of listSourceFiles(surfaceDir)) {
    const content = fs.readFileSync(file, 'utf8')
    if (content.includes(importToken)) {
      hits.push(file)
    }
  }
  return hits
}

function kerlBridgeInstruction(): BridgeExecutionInstruction {
  const instruction = createBridgeExecutionInstruction({
    pid: 7,
    isNative: false,
    amount: '1000000000000000000',
  })
  return { ...instruction, source: INSTRUCTION_SOURCE_KERL_PREVIEW }
}

function validHandoffPackage(overrides: Partial<DryRunHandoffPackage> = {}): DryRunHandoffPackage {
  const instruction = kerlBridgeInstruction()
  return {
    packageVersion: HANDOFF_PACKAGE_VERSION,
    packageId: 'handoff-pkg-test-001',
    correlationId: instruction.correlationId,
    handoffMode: 'dry_run',
    createdAt: new Date().toISOString(),
    dryRunManifest: {
      executionMode: 'DRY_RUN_ONLY',
      executionPerformed: false,
      walletInteraction: 'none',
      networkCommunication: false,
      transmitted: false,
      transactionHash: null,
      receipt: null,
      settlement: null,
    },
    proposedInstruction: instruction,
    kerlReference: {
      swarmVerdict: 'KERL_LIVE_INTEGRATION_RC1_REMOTE_CERTIFIED',
      rcVersion: 'rc1',
    },
    ...overrides,
  }
}

describe('KERL dry-run handoff consumer — package validation', () => {
  it('accepts a valid KERL dry-run handoff package shape', () => {
    const result = validateDryRunHandoffPackage(validHandoffPackage())
    expect(result.ok).toBe(true)
  })

  it('rejects invalid package (non-object)', () => {
    const result = validateDryRunHandoffPackage(null)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(HANDOFF_ERROR_CODES.INVALID_PACKAGE)
    }
  })

  it('rejects live handoff mode', () => {
    const result = validateDryRunHandoffPackage(validHandoffPackage({ handoffMode: 'live' }))
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(HANDOFF_ERROR_CODES.LIVE_MODE)
    }
  })

  it('rejects missing dry-run manifest', () => {
    const pkg = validHandoffPackage()
    const broken = { ...pkg, dryRunManifest: undefined as unknown as DryRunHandoffPackage['dryRunManifest'] }
    const result = validateDryRunHandoffPackage(broken)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(HANDOFF_ERROR_CODES.MISSING_MANIFEST)
    }
  })

  it('rejects missing proposed instruction', () => {
    const pkg = validHandoffPackage()
    const broken = {
      ...pkg,
      proposedInstruction: undefined as unknown as DryRunHandoffPackage['proposedInstruction'],
    }
    const result = validateDryRunHandoffPackage(broken)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(HANDOFF_ERROR_CODES.MISSING_INSTRUCTION)
    }
  })

  it('rejects package implying wallet interaction', () => {
    const pkg = validHandoffPackage({
      dryRunManifest: {
        ...validHandoffPackage().dryRunManifest,
        walletInteraction: 'sign' as 'none',
      },
    })
    const result = validateDryRunHandoffPackage(pkg)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(HANDOFF_ERROR_CODES.WALLET_IMPLIED)
    }
  })

  it('rejects package implying transaction hash', () => {
    const pkg = validHandoffPackage({
      dryRunManifest: {
        ...validHandoffPackage().dryRunManifest,
        transactionHash: '0xdeadbeef' as unknown as null,
      },
    })
    const result = validateDryRunHandoffPackage(pkg)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(HANDOFF_ERROR_CODES.TRANSACTION_HASH_IMPLIED)
    }
  })

  it('rejects package implying receipt', () => {
    const pkg = validHandoffPackage({
      dryRunManifest: {
        ...validHandoffPackage().dryRunManifest,
        receipt: { status: 1 } as unknown as null,
      },
    })
    const result = validateDryRunHandoffPackage(pkg)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(HANDOFF_ERROR_CODES.RECEIPT_IMPLIED)
    }
  })

  it('rejects package implying settlement', () => {
    const pkg = {
      ...validHandoffPackage(),
      settlement: { amount: '1' },
    } as unknown as DryRunHandoffPackage
    const result = validateDryRunHandoffPackage(pkg)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(HANDOFF_ERROR_CODES.SETTLEMENT_IMPLIED)
    }
  })

  it('rejects package implying treasury submission', () => {
    const pkg = validHandoffPackage({
      dryRunManifest: {
        ...validHandoffPackage().dryRunManifest,
        treasurySubmission: { sku: 'test' } as unknown as null,
      },
    })
    const result = validateDryRunHandoffPackage(pkg)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(HANDOFF_ERROR_CODES.TREASURY_IMPLIED)
    }
  })

  it('allows transmitted internal-test only', () => {
    const pkg = validHandoffPackage({
      dryRunManifest: {
        ...validHandoffPackage().dryRunManifest,
        transmitted: 'internal-test',
      },
    })
    expect(validateDryRunHandoffPackage(pkg).ok).toBe(true)
  })
})

describe('KERL dry-run handoff consumer — gateway integration', () => {
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

  it('consumes valid handoff and returns dry-run ExecutionReport', () => {
    const pkg = validHandoffPackage()
    const result = consumeKerlDryRunHandoffPackage(pkg, { account: '0xconsumer', chainId: 56 })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.packageId).toBe(pkg.packageId)
      expect(result.report.status).toBe('dry_run_completed')
      expect(result.dryRun.executionPerformed).toBe(false)
      expect(result.dryRun.walletInteraction).toBe('none')
      expect(result.dryRun.transactionHash).toBeNull()
      expect(result.dryRun.receipt).toBeNull()
      expect(result.dryRun.settlement).toBeNull()
      expect(result.dryRun.executionSuppressed).toBe(true)
      assertReportDoesNotImplySettlement(result.report)
    }
  })

  it('rejects unsupported instruction type inside handoff package', () => {
    const pkg = validHandoffPackage()
    const broken = {
      ...pkg,
      proposedInstruction: {
        ...pkg.proposedInstruction,
        domain: 'liquidity',
        adapter: 'stable-swap',
      },
    } as DryRunHandoffPackage

    const result = consumeKerlDryRunHandoffPackage(broken)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('INGRESS_UNSUPPORTED_TYPE')
    }
  })

  it('calls only acceptKerlExecutionInstruction (dry-run gateway path)', async () => {
    const acceptSpy = vi.spyOn(kerlGatewayModule, 'acceptKerlExecutionInstruction')
    const dispatchModule = await import('lib/execution-ingress/dispatch')
    const dispatchSpy = vi.spyOn(dispatchModule, 'dispatchExecutionInstruction')

    consumeKerlDryRunHandoffPackage(validHandoffPackage())

    expect(acceptSpy).toHaveBeenCalledTimes(1)
    expect(dispatchSpy).not.toHaveBeenCalled()
  })

  it('never reaches adapter dispatch or wallet submission', async () => {
    const dispatchModule = await import('lib/execution-ingress/dispatch')
    const dispatchSpy = vi.spyOn(dispatchModule, 'dispatchExecutionInstruction')
    const trackSpy = vi.spyOn(trackExecutionModule, 'trackExecutionSubmission')

    const result = consumeKerlDryRunHandoffPackage(validHandoffPackage(), { account: '0xhandoff', chainId: 56 })

    expect(result.ok).toBe(true)
    expect(dispatchSpy).not.toHaveBeenCalled()
    expect(trackSpy).not.toHaveBeenCalled()

    const tracker = ExecutionTracker.forScope('0xhandoff', 56)
    const record = tracker.getByInstructionId(validHandoffPackage().proposedInstruction.id)
    expect(record?.events.some((e) => e.type === 'wallet_submission_started')).toBe(false)
    expect(record?.events.some((e) => e.type === 'execution_suppressed')).toBe(true)
  })

  it('rejects live handoff before gateway invocation', () => {
    const acceptSpy = vi.spyOn(kerlGatewayModule, 'acceptKerlExecutionInstruction')
    const result = consumeKerlDryRunHandoffPackage(validHandoffPackage({ handoffMode: 'live' }))

    expect(result.ok).toBe(false)
    expect(acceptSpy).not.toHaveBeenCalled()
  })
})

describe('KERL dry-run handoff consumer — forbidden boundaries', () => {
  it('does not import treasury modules', () => {
    expect(scanForbiddenImports(CONSUMER_DIR, HANDOFF_FORBIDDEN_TREASURY_IMPORTS)).toEqual([])
  })

  it('does not import KERL/Swarm runtime', () => {
    expect(scanForbiddenImports(CONSUMER_DIR, HANDOFF_FORBIDDEN_KERL_RUNTIME_IMPORTS)).toEqual([])
  })

  it('does not import live dispatch', () => {
    expect(scanForbiddenImports(CONSUMER_DIR, HANDOFF_FORBIDDEN_DISPATCH_IMPORTS)).toEqual([])
  })

  it('does not import UI surfaces', () => {
    expect(scanForbiddenImports(CONSUMER_DIR, HANDOFF_FORBIDDEN_UI_IMPORTS)).toEqual([])
  })

  it('ownership forbids live execution and public exposure', () => {
    expect(HANDOFF_CONSUMER_OWNERSHIP.mustNeverOwn).toContain('live execution')
    expect(HANDOFF_CONSUMER_OWNERSHIP.mustNeverOwn).toContain('public API exposure')
    expect(HANDOFF_CONSUMER_OWNERSHIP.mustNeverOwn).toContain('treasury submission')
  })

  it('report surfaces exclude settlement fields', () => {
    setExecutionGatewayEnabled(true)
    const result = consumeKerlDryRunHandoffPackage(validHandoffPackage())
    resetExecutionGatewayActivation()
    ExecutionTracker.resetForTests()

    expect(result.ok).toBe(true)
    if (result.ok) {
      for (const field of SETTLEMENT_FORBIDDEN_FIELDS) {
        expect(field in (result.report as Record<string, unknown>)).toBe(false)
      }
    }
  })
})

describe('KERL dry-run handoff consumer — surface isolation', () => {
  it('has no UI route imports', () => {
    expect(scanSurfaceImports(VIEWS_DIR, 'execution-handoff-consumer')).toEqual([])
    expect(scanSurfaceImports(PAGES_DIR, 'execution-handoff-consumer')).toEqual([])
  })

  it('has no public API exposure', () => {
    expect(scanSurfaceImports(API_DIR, 'execution-handoff-consumer')).toEqual([])
    expect(scanSurfaceImports(PAGES_DIR, 'consumeKerlDryRunHandoffPackage')).toEqual([])
  })

  it('existing UI commit buttons remain unchanged (no handoff consumer wiring)', () => {
    for (const file of UI_COMMIT_BUTTONS) {
      const content = fs.readFileSync(file, 'utf8')
      expect(content).not.toContain('execution-handoff-consumer')
      expect(content).not.toContain('consumeKerlDryRunHandoffPackage')
    }
  })
})
