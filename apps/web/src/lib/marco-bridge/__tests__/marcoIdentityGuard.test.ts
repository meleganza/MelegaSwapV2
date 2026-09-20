import { describe, expect, it } from 'vitest'
import {
  CANONICAL_MARCO_DECIMALS,
  CANONICAL_MARCO_NAME,
  CANONICAL_MARCO_SHARED_DECIMALS,
  CANONICAL_MARCO_SYMBOL,
  assertCanonicalMarcoIdentity,
  assertNewOftIdentity,
  isCanonicalMarcoIdentity,
  isForbiddenMarcoMarco,
  marcoIdentityBlockers,
} from '../marcoIdentityGuard'

const good = {
  name: CANONICAL_MARCO_NAME,
  symbol: CANONICAL_MARCO_SYMBOL,
  decimals: CANONICAL_MARCO_DECIMALS,
  sharedDecimals: CANONICAL_MARCO_SHARED_DECIMALS,
  totalSupply: 0,
}

describe('canonical MARCO identity guard', () => {
  it('accepts MELEGA / MARCO / 18 / shared 6', () => {
    expect(isCanonicalMarcoIdentity(good)).toBe(true)
    expect(assertCanonicalMarcoIdentity(good)).toBe(true)
    expect(assertNewOftIdentity(good)).toBe(true)
  })

  it('HARD STOPs MARCO/MARCO', () => {
    const bad = { ...good, name: 'MARCO', symbol: 'MARCO' }
    expect(isForbiddenMarcoMarco(bad)).toBe(true)
    expect(marcoIdentityBlockers(bad)[0]).toMatch(/MARCO\/MARCO is forbidden/)
    expect(() => assertCanonicalMarcoIdentity(bad)).toThrow('MARCO/MARCO is forbidden')
  })

  it('rejects name or symbol drift', () => {
    expect(() => assertCanonicalMarcoIdentity({ ...good, name: 'MELEGA TOKEN' })).toThrow('Name must be MELEGA')
    expect(() => assertCanonicalMarcoIdentity({ ...good, symbol: 'MELEGA' })).toThrow('Symbol must be MARCO')
  })

  it('rejects wrong decimals or sharedDecimals', () => {
    expect(() => assertCanonicalMarcoIdentity({ ...good, decimals: 9 })).toThrow('Decimals must be 18')
    expect(() => assertCanonicalMarcoIdentity({ ...good, sharedDecimals: 18 })).toThrow('sharedDecimals must be 6')
  })

  it('rejects a pre-bridged destination supply', () => {
    expect(() => assertNewOftIdentity({ ...good, totalSupply: '10000000000000000000000000' })).toThrow(
      'initial supply must be 0',
    )
  })

  it('requires sharedDecimals on a new OFT', () => {
    const { sharedDecimals: _omit, ...rest } = good
    expect(() => assertNewOftIdentity(rest)).toThrow('must expose sharedDecimals=6')
  })
})
