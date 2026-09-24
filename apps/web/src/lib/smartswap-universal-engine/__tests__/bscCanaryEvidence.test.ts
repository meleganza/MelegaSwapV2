import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const EVIDENCE = path.resolve(
  __dirname,
  '../../../../../../deployments/smartswap-executor-v2/bsc-mainnet-canary-evidence/evidence.json',
)
const RAW = readFileSync(EVIDENCE, 'utf8')
const ev = JSON.parse(RAW)

/** Keys allowed to stay JSON numbers (small metadata, always < 2^53). */
const NUMERIC_METADATA_KEYS = new Set(['chainId', 'block', 'status', 'feeBps', 'gasUsed'])

const DECIMAL = /^(0|[1-9]\d*)$/

function raw(value: unknown): bigint {
  expect(typeof value).toBe('string')
  expect(value as string).toMatch(DECIMAL)
  return BigInt(value as string)
}

function walk(value: unknown, trail: string, key: string, out: string[]) {
  if (Array.isArray(value)) {
    value.forEach((row, i) => walk(row, `${trail}[${i}]`, key, out))
    return
  }
  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([k, v]) => walk(v, `${trail}.${k}`, k, out))
    return
  }
  if (typeof value === 'number' && !NUMERIC_METADATA_KEYS.has(key)) out.push(trail)
}

describe('BSC SmartSwapExecutorV2 canary evidence integrity', () => {
  it('has no unsafe integer literals in the raw JSON text', () => {
    const literals = [...RAW.matchAll(/:\s*(-?\d+)\s*[,\n}\]]/g)].map((m) => m[1])
    literals.forEach((lit) => expect(Number.isSafeInteger(Number(lit)), lit).toBe(true))
  })

  it('uses JSON numbers only for small metadata keys', () => {
    const offenders: string[] = []
    walk(ev, '$', '$', offenders)
    expect(offenders).toEqual([])
  })

  it('keeps production state disabled in the record', () => {
    expect(ev.classification.PUBLIC_V2_EXECUTION).toBe('DISABLED')
    expect(ev.classification.PRODUCTION_ENABLED).toBe(false)
    expect(ev.classification.CUTOVER).toBe(false)
    expect(ev.classification.ETHEREUM).toBe('UNTOUCHED')
  })

  it('records exact Canary 1 raw values', () => {
    const c1 = ev.canary1
    expect(c1.tx).toBe('0x4f167d5bb5abdf7ac438e596a91ac086ed5fe5b5b7966694b8e48eb28d79a9fe')
    expect(c1.block).toBe(123812480)
    expect(c1.status).toBe(1)
    expect(raw(c1.input)).toBe(1000000000000000n)
    expect(raw(c1.embeddedValue)).toBe(1000000000000000n)
    expect(raw(c1.outerValue)).toBe(0n)
    expect(c1.feeBps).toBe(20)
    expect(raw(c1.feeAmount)).toBe(2000000000000n)
    expect(raw(c1.treasuryDelta)).toBe(2000000000000n)
    expect(raw(c1.netVenueInput)).toBe(998000000000000n)
    expect(raw(c1.minUserOut)).toBe(773061674120213652n)
    expect(raw(c1.actualUserOut)).toBe(776946406150968495n)
    expect(raw(c1.nonce)).toBe(1790277836205n)
    expect(raw(c1.effectiveGasPrice)).toBe(50000000n)
    expect(raw(c1.gasCostWei)).toBe(16829400000000n)
    expect(BigInt(c1.gasUsed) * raw(c1.effectiveGasPrice)).toBe(raw(c1.gasCostWei))
    expect(raw(c1.input) - raw(c1.feeAmount)).toBe(raw(c1.netVenueInput))
    expect(raw(c1.actualUserOut) >= raw(c1.minUserOut)).toBe(true)
  })

  it('records exact Canary 2 raw values', () => {
    const c2 = ev.canary2
    expect(c2.tx).toBe('0xe5826b8e28c58f3f52ed2b8bd5adfa521a3139e3d4569ccdfad892de6ef576fa')
    expect(c2.block).toBe(123819660)
    expect(c2.status).toBe(1)
    expect(c2.approval.tx).toBe('0x04b9f2591b3c1d86d8646fc784e5c0afa04ae2d7c794dfa1b16f1b7a5d4213ae')
    expect(raw(c2.approval.amount)).toBe(388473203075484247n)
    expect(c2.approval.isMaxUint).toBe(false)
    expect(raw(c2.approval.gas.costWei)).toBe(2673200000000n)
    expect(raw(c2.input)).toBe(388473203075484247n)
    expect(c2.feeBps).toBe(20)
    expect(raw(c2.feeAmount)).toBe(776946406150968n)
    expect(raw(c2.treasuryDelta)).toBe(776946406150968n)
    expect(raw(c2.netVenueInput)).toBe(387696256669333279n)
    expect(raw(c2.melegaQuote)).toBe(442813375845862n)
    expect(raw(c2.pancakeQuote)).toBe(495776198202838n)
    expect(raw(c2.minUserOut)).toBe(493297317211823n)
    expect(raw(c2.actualUserOut)).toBe(495776198202838n)
    expect(raw(c2.nonce)).toBe(1790281105994n)
    expect(raw(c2.effectiveGasPrice)).toBe(50000000n)
    expect(raw(c2.gasCostWei)).toBe(18163800000000n)
    expect(BigInt(c2.gasUsed) * raw(c2.effectiveGasPrice)).toBe(raw(c2.gasCostWei))
    expect(raw(c2.input) - raw(c2.feeAmount)).toBe(raw(c2.netVenueInput))
    expect(raw(c2.actualUserOut) >= raw(c2.minUserOut)).toBe(true)
    const bal = c2.userNativeBalance
    expect(raw(bal.block) - raw(bal.blockMinus1)).toBe(raw(bal.netDeltaAfterGas))
    expect(raw(bal.netDeltaAfterGas)).toBe(raw(c2.actualUserOut) - raw(c2.gasCostWei))
    Object.values(c2.allowancesAfter).forEach((v) => expect(raw(v)).toBe(0n))
    Object.values(c2.executorRetainedFunds).forEach((v) => expect(raw(v)).toBe(0n))
    expect(c2.nonce).not.toBe(ev.canary1.nonce)
  })
})
