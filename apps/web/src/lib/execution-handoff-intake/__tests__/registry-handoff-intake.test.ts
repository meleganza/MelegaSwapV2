import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import fs from 'fs'
import path from 'path'

import { assertReportDoesNotImplySettlement } from 'lib/execution-contract'
import {
  HANDOFF_ERROR_CODES,
  HANDSHAKE_ERROR_CODES,
} from 'lib/execution-handoff-consumer'
import { RC1_OFFLINE_FIXTURE_ID } from 'lib/execution-handoff-consumer/__fixtures__/rc1-offline-dry-run-handoff.fixture'
import { CERTIFIED_DRY_RUN_HANDOFF_FIXTURE } from 'lib/execution-handoff-consumer/__fixtures__/certified-dry-run-handoff.fixture'
import {
  buildInvalidRc1FixtureLiveMode,
  buildInvalidRc1FixtureWithTxHash,
  buildInvalidRc1FixtureWithWalletData,
} from 'lib/execution-handoff-consumer/__fixtures__/rc1-offline-dry-run-handoff.fixture'
import {
  buildCertifiedFixtureIncompatibleOutcome,
  buildCertifiedFixtureInvalidVerdict,
  buildCertifiedFixtureMissingCertification,
} from 'lib/execution-handoff-consumer/__fixtures__/certified-dry-run-handoff.fixture'
import {
  setExecutionGatewayEnabled,
  resetExecutionGatewayActivation,
} from 'lib/execution-gateway'
import * as kerlGatewayModule from 'lib/execution-ingress/kerl-gateway'
import { resetInternalIngressActivation } from 'lib/execution-ingress'
import { ExecutionTracker } from 'lib/execution-tracker/tracker'
import * as trackExecutionModule from 'lib/execution-tracker/trackExecution'
import {
  REGISTRY_INTAKE_ERROR_CODES,
  getSeedRegistryHandoffRelativePath,
  intakeRegistryHandoffFromFile,
  intakeRegistryHandoffJson,
  intakeSeedRegistryHandoff,
  readLocalRegistryHandoffJson,
  readSeedRegistryHandoffJson,
  resolveKerlRegistryRoot,
  validateRegistryHandoffJson,
} from 'lib/execution-handoff-intake'

const UI_COMMIT_BUTTONS = [
  path.resolve(__dirname, '../../../views/Swap/SmartSwap/components/SmartSwapCommitButton.tsx'),
  path.resolve(__dirname, '../../../views/Swap/components/SwapCommitButton.tsx'),
  path.resolve(__dirname, '../../../views/Bridge/BridgeForm/components/SmartSwapCommitButton.tsx'),
]

const PAGES_API_DIR = path.resolve(__dirname, '../../../pages/api')

function scanSurfaceImports(dir: string, needle: string): string[] {
  if (!fs.existsSync(dir)) return []
  const hits: string[] = []
  const walk = (current: string) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
        const content = fs.readFileSync(full, 'utf8')
        if (content.includes(needle)) hits.push(full)
      }
    }
  }
  walk(dir)
  return hits
}

describe('KERL registry handoff intake — artifacts', () => {
  it('seed registry artifact exists on disk', () => {
    const loaded = readSeedRegistryHandoffJson()
    expect(loaded.ok).toBe(true)
  })

  it('registry index exists under public/registry/kerl', () => {
    const indexPath = path.join(resolveKerlRegistryRoot(), 'index.json')
    expect(fs.existsSync(indexPath)).toBe(true)
  })
})

describe('KERL registry handoff intake — acceptance', () => {
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

  it('accepts seeded registry fixture through certified handshake', () => {
    const result = intakeSeedRegistryHandoff({ account: '0xregistry-intake', chainId: 56 })

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.packageId).toBe(RC1_OFFLINE_FIXTURE_ID)
      expect(result.report.status).toBe('dry_run_completed')
      expect(result.dryRun.executionPerformed).toBe(false)
      expect(result.dryRun.executionSuppressed).toBe(true)
      assertReportDoesNotImplySettlement(result.report)
    }
  })

  it('loads seed file via relative path intake', () => {
    const result = intakeRegistryHandoffFromFile(getSeedRegistryHandoffRelativePath(), {
      account: '0xregistry-file',
      chainId: 56,
    })
    expect(result.ok).toBe(true)
  })

  it('registry JSON mirrors fixture semantics', () => {
    const loaded = readSeedRegistryHandoffJson()
    expect(loaded.ok).toBe(true)
    if (loaded.ok) {
      const pkg = loaded.value as typeof CERTIFIED_DRY_RUN_HANDOFF_FIXTURE
      expect(pkg.packageId).toBe(CERTIFIED_DRY_RUN_HANDOFF_FIXTURE.packageId)
      expect(pkg.proposedInstruction.id).toBe(CERTIFIED_DRY_RUN_HANDOFF_FIXTURE.proposedInstruction.id)
    }
  })
})

describe('KERL registry handoff intake — rejections', () => {
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

  it('rejects malformed JSON at load stage', () => {
    const root = resolveKerlRegistryRoot()
    const badRel = 'handoffs/__test-malformed__.json'
    const badAbs = path.join(root, badRel)
    fs.mkdirSync(path.dirname(badAbs), { recursive: true })
    fs.writeFileSync(badAbs, '{ not valid json')

    const loaded = readLocalRegistryHandoffJson(badRel)
    expect(loaded.ok).toBe(false)
    if (!loaded.ok) {
      expect(loaded.error.code).toBe(REGISTRY_INTAKE_ERROR_CODES.MALFORMED_JSON)
    }
    fs.unlinkSync(badAbs)
  })

  it('rejects live handoff mode', () => {
    const result = intakeRegistryHandoffJson(buildInvalidRc1FixtureLiveMode())
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(HANDOFF_ERROR_CODES.LIVE_MODE)
    }
  })

  it('rejects network URLs in registry artifact', () => {
    const pkg = {
      ...CERTIFIED_DRY_RUN_HANDOFF_FIXTURE,
      kerlReference: {
        ...CERTIFIED_DRY_RUN_HANDOFF_FIXTURE.kerlReference,
        remoteEndpoint: 'https://swarm.example/kerl/handoff',
      },
    }
    const validation = validateRegistryHandoffJson(pkg)
    expect(validation.ok).toBe(false)
    if (!validation.ok) {
      expect(validation.error.code).toBe(REGISTRY_INTAKE_ERROR_CODES.NETWORK_URL_FORBIDDEN)
    }

    const intake = intakeRegistryHandoffJson(pkg)
    expect(intake.ok).toBe(false)
    if (!intake.ok) {
      expect(intake.stage).toBe('registry_validate')
    }
  })

  it('rejects wallet data in envelope', () => {
    const result = intakeRegistryHandoffJson(buildInvalidRc1FixtureWithWalletData())
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect([
        HANDOFF_ERROR_CODES.INVALID_PACKAGE,
        HANDOFF_ERROR_CODES.WALLET_IMPLIED,
        HANDSHAKE_ERROR_CODES.MISSING_RC1_ENVELOPE,
      ]).toContain(result.error.code)
    }
  })

  it('rejects transaction hash in manifest', () => {
    const result = intakeRegistryHandoffJson(buildInvalidRc1FixtureWithTxHash())
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect([HANDOFF_ERROR_CODES.TRANSACTION_HASH_IMPLIED, HANDSHAKE_ERROR_CODES.INVALID_MANIFEST]).toContain(
        result.error.code,
      )
    }
  })

  it('rejects receipt in manifest', () => {
    const pkg = {
      ...CERTIFIED_DRY_RUN_HANDOFF_FIXTURE,
      dryRunManifest: {
        ...CERTIFIED_DRY_RUN_HANDOFF_FIXTURE.dryRunManifest,
        receipt: { status: 1 } as unknown as null,
      },
    }
    const result = intakeRegistryHandoffJson(pkg)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect([HANDOFF_ERROR_CODES.RECEIPT_IMPLIED, HANDSHAKE_ERROR_CODES.INVALID_MANIFEST]).toContain(result.error.code)
    }
  })

  it('rejects settlement in manifest', () => {
    const pkg = {
      ...CERTIFIED_DRY_RUN_HANDOFF_FIXTURE,
      dryRunManifest: {
        ...CERTIFIED_DRY_RUN_HANDOFF_FIXTURE.dryRunManifest,
        settlement: { event: 'forbidden' } as unknown as null,
      },
    }
    const result = intakeRegistryHandoffJson(pkg)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect([HANDOFF_ERROR_CODES.SETTLEMENT_IMPLIED, HANDSHAKE_ERROR_CODES.INVALID_MANIFEST]).toContain(
        result.error.code,
      )
    }
  })

  it('rejects execution_performed true', () => {
    const pkg = {
      ...CERTIFIED_DRY_RUN_HANDOFF_FIXTURE,
      dryRunManifest: {
        ...CERTIFIED_DRY_RUN_HANDOFF_FIXTURE.dryRunManifest,
        executionPerformed: true as false,
      },
    }
    const result = intakeRegistryHandoffJson(pkg)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect([HANDOFF_ERROR_CODES.EXECUTION_IMPLIED, HANDSHAKE_ERROR_CODES.INVALID_MANIFEST]).toContain(
        result.error.code,
      )
    }
  })

  it('rejects missing certification before gateway', () => {
    const acceptSpy = vi.spyOn(kerlGatewayModule, 'acceptKerlExecutionInstruction')
    const result = intakeRegistryHandoffJson(buildCertifiedFixtureMissingCertification())
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(HANDSHAKE_ERROR_CODES.MISSING_CERTIFICATION)
    }
    expect(acceptSpy).not.toHaveBeenCalled()
  })

  it('rejects invalid certification verdict', () => {
    const result = intakeRegistryHandoffJson(buildCertifiedFixtureInvalidVerdict())
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(HANDSHAKE_ERROR_CODES.INVALID_CERTIFICATION_VERDICT)
    }
  })

  it('rejects incompatible certification', () => {
    const result = intakeRegistryHandoffJson(buildCertifiedFixtureIncompatibleOutcome())
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(HANDSHAKE_ERROR_CODES.CERTIFICATION_INCOMPATIBLE)
    }
  })

  it('rejects path traversal for registry file paths', () => {
    const loaded = readLocalRegistryHandoffJson('../package.json')
    expect(loaded.ok).toBe(false)
    if (!loaded.ok) {
      expect(loaded.error.code).toBe(REGISTRY_INTAKE_ERROR_CODES.PATH_TRAVERSAL)
    }
  })

  it('rejects network URL as registry file path', () => {
    const loaded = readLocalRegistryHandoffJson('https://evil.example/handoff.json')
    expect(loaded.ok).toBe(false)
    if (!loaded.ok) {
      expect(loaded.error.code).toBe(REGISTRY_INTAKE_ERROR_CODES.NETWORK_URL_FORBIDDEN)
    }
  })
})

describe('KERL registry handoff intake — dry-run boundary', () => {
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

  it('reaches only certified dry-run handshake pipeline', () => {
    const result = intakeSeedRegistryHandoff({ account: '0xhandshake-only', chainId: 56 })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.handshake).toBe('certified')
      expect(result.dryRun.executionMode).toBe('DRY_RUN_ONLY')
    }
  })

  it('never reaches adapter dispatch or wallet submission', async () => {
    const dispatchModule = await import('lib/execution-ingress/dispatch')
    const dispatchSpy = vi.spyOn(dispatchModule, 'dispatchExecutionInstruction')
    const trackSpy = vi.spyOn(trackExecutionModule, 'trackExecutionSubmission')

    const result = intakeSeedRegistryHandoff({ account: '0xno-dispatch-registry', chainId: 56 })

    expect(result.ok).toBe(true)
    expect(dispatchSpy).not.toHaveBeenCalled()
    expect(trackSpy).not.toHaveBeenCalled()

    const loaded = readSeedRegistryHandoffJson()
    if (loaded.ok) {
      const pkg = loaded.value as typeof CERTIFIED_DRY_RUN_HANDOFF_FIXTURE
      const tracker = ExecutionTracker.forScope('0xno-dispatch-registry', 56)
      const record = tracker.getByInstructionId(pkg.proposedInstruction.id)
      expect(record?.events.map((e) => e.type)).toContain('execution_suppressed')
      expect(record?.events.map((e) => e.type)).not.toContain('transaction_submitted')
    }
  })
})

describe('KERL registry handoff intake — surface isolation', () => {
  it('is not imported by UI commit buttons', () => {
    for (const file of UI_COMMIT_BUTTONS) {
      const content = fs.readFileSync(file, 'utf8')
      expect(content).not.toContain('execution-handoff-intake')
      expect(content).not.toContain('intakeSeedRegistryHandoff')
      expect(content).not.toContain('intakeRegistryHandoffFromFile')
    }
  })

  it('is not exposed via pages/api', () => {
    expect(scanSurfaceImports(PAGES_API_DIR, 'execution-handoff-intake')).toEqual([])
    expect(scanSurfaceImports(PAGES_API_DIR, 'intakeSeedRegistryHandoff')).toEqual([])
  })

  it('existing UI commit button behaviour unchanged', () => {
    for (const file of UI_COMMIT_BUTTONS) {
      const content = fs.readFileSync(file, 'utf8')
      expect(content).toMatch(/useSmartSwapExecution|useV2SwapExecution|useBridgeExecution/)
    }
  })
})
