/**
 * Guards against ethers INVALID_ARGUMENT types/values length mismatch on
 * activeProgram(owner, projectToken, quoteAsset, pair).
 */
import { Interface } from '@ethersproject/abi'
import { describe, expect, it } from 'vitest'
import { activeProgramCallArgs } from '../activeProgramCallArgs'

const iface = new Interface([
  'function activeProgram(address owner, address projectToken, address quoteAsset, address pair) view returns (address)',
])

describe('useProgramReadModel activeProgram crash guard', () => {
  it('returns null when any arg missing', () => {
    expect(activeProgramCallArgs(null, '0x1111111111111111111111111111111111111111', '0x2222222222222222222222222222222222222222', '0x3333333333333333333333333333333333333333')).toBeNull()
    expect(activeProgramCallArgs('0x2222222222222222222222222222222222222222', null, '0x2222222222222222222222222222222222222222', '0x3333333333333333333333333333333333333333')).toBeNull()
    expect(activeProgramCallArgs(undefined, undefined, undefined, undefined)).toBeNull()
  })

  it('returns 4-arg tuple when complete', () => {
    const args = activeProgramCallArgs(
      '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0',
      '0x55d398326f99059fF775485246999027B3197955',
      '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      '0x94FADf053BaD0c9d0a3874F82b1a09001926A548',
    )
    expect(args).toHaveLength(4)
  })

  it('reproduces production crash: encodeFunctionData(activeProgram, undefined) throws', () => {
    expect(() => iface.encodeFunctionData('activeProgram', undefined as unknown as [])).toThrow()
  })

  it('encodes 4-arg activeProgram safely', () => {
    const args = activeProgramCallArgs(
      '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0',
      '0x55d398326f99059fF775485246999027B3197955',
      '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      '0x94FADf053BaD0c9d0a3874F82b1a09001926A548',
    )
    const data = iface.encodeFunctionData('activeProgram', args!)
    expect(data.startsWith('0x')).toBe(true)
  })
})
