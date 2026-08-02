/**
 * Guards the /liquidity/ Error Boundary crash:
 * ethers INVALID_ARGUMENT types/values length mismatch on activeProgram(owner, projectToken)
 * when owner/projectToken are missing and multicall encodes zero args.
 */
import { describe, expect, it } from 'vitest'
import { Interface } from '@ethersproject/abi'
import { LB_FACTORY_READ_ABI } from '../abi/fragments'
import { activeProgramCallArgs } from '../activeProgramCallArgs'

describe('useProgramReadModel activeProgram crash guard', () => {
  const iface = new Interface(LB_FACTORY_READ_ABI as unknown as string[])

  it('returns null args when owner or projectToken missing (skip call)', () => {
    expect(activeProgramCallArgs(null, '0x1111111111111111111111111111111111111111')).toBeNull()
    expect(activeProgramCallArgs('0x2222222222222222222222222222222222222222', null)).toBeNull()
    expect(activeProgramCallArgs(undefined, undefined)).toBeNull()
    expect(activeProgramCallArgs('', '0x1111111111111111111111111111111111111111')).toBeNull()
  })

  it('returns both addresses when ready', () => {
    const args = activeProgramCallArgs(
      '0x2222222222222222222222222222222222222222',
      '0x1111111111111111111111111111111111111111',
    )
    expect(args).toEqual([
      '0x2222222222222222222222222222222222222222',
      '0x1111111111111111111111111111111111111111',
    ])
  })

  it('reproduces production crash: encodeFunctionData(activeProgram, undefined) throws', () => {
    expect(() => iface.encodeFunctionData('activeProgram', undefined as unknown as [])).toThrow(
      /types\/values length mismatch|INVALID_ARGUMENT/,
    )
  })

  it('encodes cleanly only when both args present', () => {
    const args = activeProgramCallArgs(
      '0x2222222222222222222222222222222222222222',
      '0x1111111111111111111111111111111111111111',
    )
    expect(args).not.toBeNull()
    const data = iface.encodeFunctionData('activeProgram', args!)
    expect(data.startsWith('0x')).toBe(true)
    expect(data.length).toBeGreaterThan(10)
  })
})
