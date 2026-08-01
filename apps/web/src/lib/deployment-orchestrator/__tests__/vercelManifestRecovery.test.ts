import { describe, expect, it } from 'vitest'
import { execSync } from 'node:child_process'
import { existsSync, readFileSync, renameSync, statSync } from 'node:fs'
import path from 'node:path'

const WEB = path.resolve(__dirname, '../../../..')
const REPO = path.resolve(WEB, '../..')
const SCRIPT = path.join(WEB, 'scripts/generate-lb-certified-manifest.mjs')
const MANIFEST = path.join(WEB, 'src/lib/deployment-orchestrator/artifacts/lb-v1-certified.json')
const OUT = path.join(REPO, 'out')
const OUT_BAK = path.join(REPO, 'out.__vercel_recovery_bak__')

const ORDER = [
  'LiquidityBuildingExecutionMathV1',
  'LiquidityBuildingTreasuryFeeReceiverV1',
  'LiquidityBuildingExecutionAuthorizerV1',
  'LiquidityBuildingTreasuryFeeSinkV1',
  'LiquidityBuildingProgramV1',
  'LiquidityBuildingFactoryV1',
]

function run(cmd: string, cwd = WEB) {
  return execSync(cmd, { cwd, encoding: 'utf8', stdio: 'pipe' })
}

describe('Vercel LB manifest recovery', () => {
  it('committed manifest exists with six contracts and matching creation hashes', () => {
    expect(existsSync(MANIFEST)).toBe(true)
    const m = JSON.parse(readFileSync(MANIFEST, 'utf8'))
    expect(m.deployOrder).toEqual(ORDER)
    expect(Object.keys(m.artifacts)).toHaveLength(6)
    expect(m.chainId).toBe(56)
    expect(m.treasuryDestination).toBe('0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b')
    expect(m.successFeeBps).toBe(1000)
    expect(m.sourceFingerprint).toMatch(/^0x[a-f0-9]{64}$/i)
    for (const name of ORDER) {
      const a = m.artifacts[name]
      expect(a.creationBytecode.startsWith('0x')).toBe(true)
      expect(a.creationBytecode.length).toBeGreaterThan(4)
      expect(a.runtimeHashMatchesCertified).toBe(true)
      expect(a.expectedRuntimeBytecodeSha256).toMatch(/^0x[a-f0-9]{64}$/i)
    }
  })

  it('check-committed passes and does not mutate the manifest file', () => {
    const before = readFileSync(MANIFEST)
    const mtime = statSync(MANIFEST).mtimeMs
    const out = run(`node ${SCRIPT} --check-committed`)
    expect(out).toMatch(/integrity PASS/)
    expect(readFileSync(MANIFEST).equals(before)).toBe(true)
    expect(statSync(MANIFEST).mtimeMs).toBe(mtime)
  })

  it('check mode passes with Forge out/ absent', () => {
    const hadOut = existsSync(OUT)
    if (hadOut) {
      if (existsSync(OUT_BAK)) {
        throw new Error('backup out already exists — clean up out.__vercel_recovery_bak__')
      }
      renameSync(OUT, OUT_BAK)
    }
    try {
      expect(existsSync(path.join(OUT, 'LiquidityBuildingExecutionMathV1.sol'))).toBe(false)
      const out = run(`node ${SCRIPT} --check-committed`)
      expect(out).toMatch(/Forge out\/ absent/)
      expect(out).toMatch(/integrity PASS/)
    } finally {
      if (hadOut && existsSync(OUT_BAK)) renameSync(OUT_BAK, OUT)
    }
  })

  it('generate mode fails clearly when Forge artifacts are absent', () => {
    const hadOut = existsSync(OUT)
    if (hadOut) {
      if (existsSync(OUT_BAK)) throw new Error('backup out already exists')
      renameSync(OUT, OUT_BAK)
    }
    try {
      let failed = false
      let msg = ''
      try {
        run(`node ${SCRIPT} --generate`)
      } catch (e) {
        failed = true
        msg = String((e as { stderr?: Buffer; stdout?: Buffer; message?: string }).stderr || '') +
          String((e as { stdout?: Buffer }).stdout || '') +
          String((e as Error).message || '')
      }
      expect(failed).toBe(true)
      expect(msg).toMatch(/requires canonical Forge artifacts|missing forge artifact/i)
    } finally {
      if (hadOut && existsSync(OUT_BAK)) renameSync(OUT_BAK, OUT)
    }
  })

  it('generate and certify succeed when Forge out/ is present', () => {
    if (!existsSync(path.join(OUT, 'LiquidityBuildingExecutionMathV1.sol/LiquidityBuildingExecutionMathV1.json'))) {
      // Skip when forge output unavailable in environment
      return
    }
    const before = JSON.parse(readFileSync(MANIFEST, 'utf8'))
    run(`node ${SCRIPT} --generate`)
    const after = JSON.parse(readFileSync(MANIFEST, 'utf8'))
    for (const name of ORDER) {
      expect(after.artifacts[name].creationBytecode).toBe(before.artifacts[name].creationBytecode)
      expect(after.artifacts[name].creationBytecodeSha256).toBe(
        before.artifacts[name].creationBytecodeSha256,
      )
    }
    expect(run(`node ${SCRIPT} --certify`)).toMatch(/certify PASS/)
  })

  it('package prebuild uses check-committed only', () => {
    const pkg = JSON.parse(readFileSync(path.join(WEB, 'package.json'), 'utf8'))
    expect(pkg.scripts.prebuild).toContain('lb:manifest:check')
    expect(pkg.scripts['lb:manifest:check']).toContain('--check-committed')
    expect(pkg.scripts['lb:manifest:generate']).toContain('--generate')
    expect(pkg.scripts['lb:manifest:certify']).toContain('--certify')
    expect(pkg.scripts.prebuild).not.toContain('--generate')
  })
})
