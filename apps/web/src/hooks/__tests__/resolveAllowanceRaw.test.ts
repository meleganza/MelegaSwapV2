import { describe, expect, it } from 'vitest'
import { resolveAllowanceRaw } from '../useTokenAllowance'

const MARCO = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'
const RAKY = '0x5f7cc946aBF0c853a2367ac436755dE6AA8D48Bd'
const KEY = `56:${MARCO}:0xowner:0xrouter`

describe('resolveAllowanceRaw — disconnected token→token must not throw', () => {
  it('P0 MARCO→RAKY: missing key + missing snapshot (wallet disconnected) returns undefined', () => {
    expect(() => resolveAllowanceRaw(undefined, undefined, undefined)).not.toThrow()
    expect(resolveAllowanceRaw(undefined, undefined, undefined)).toBeUndefined()
  })

  it('does not treat undefined === undefined as a matching direct-allowance key', () => {
    expect(resolveAllowanceRaw(null, undefined, undefined)).toBeUndefined()
    expect(resolveAllowanceRaw(undefined, { key: KEY, raw: '1' }, undefined)).toBeUndefined()
  })

  it('uses multicall result when present', () => {
    expect(resolveAllowanceRaw({ toString: () => '42' }, { key: KEY, raw: '7' }, KEY)).toBe('42')
  })

  it('uses keyed direct snapshot when multicall is empty', () => {
    expect(resolveAllowanceRaw(undefined, { key: KEY, raw: '9' }, KEY)).toBe('9')
  })

  it('ignores a stale direct snapshot for a different request key', () => {
    expect(resolveAllowanceRaw(undefined, { key: `56:${RAKY}:0xowner:0xrouter`, raw: '9' }, KEY)).toBeUndefined()
  })
})
