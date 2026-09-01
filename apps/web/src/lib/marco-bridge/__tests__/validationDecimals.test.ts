import { describe, expect, it } from 'vitest'
import {
  destinationToBytes32,
  isValidEvmDestination,
  isValidMarcoDestination,
  normalizeBridgeAmount,
  parseBridgeAmount,
  parseSolanaDestination,
} from '../validation'

const evmLowercase = '0x963556de0eb8138e97a85f0a86ee0acd159d210b'
const evmChecksum = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'
const solana = '6SWgjmuTyPAcYYU77Mzf1gE6QA7ZcZsbsfiThz2cW1VF'

describe('destination validation', () => {
  it('uses canonical EVM parsing and accepts lowercase or correct checksum addresses', () => {
    expect(isValidEvmDestination(evmLowercase)).toBe(true)
    expect(isValidEvmDestination(evmChecksum)).toBe(true)
    expect(isValidEvmDestination('0x1234')).toBe(false)
    expect(isValidEvmDestination('0x963556de0eb8138E97A85F0A86eE0acD159D210B')).toBe(false)
    expect(destinationToBytes32(evmLowercase, 'evm')).toHaveLength(66)
  })

  it('requires Base58 that constructs a canonical 32-byte Solana PublicKey', () => {
    expect(parseSolanaDestination(solana)?.toBytes()).toHaveLength(32)
    expect(isValidMarcoDestination(solana, 'solana')).toBe(true)
    expect(parseSolanaDestination('1111111111111111111111111111111')).toBeNull()
    expect(parseSolanaDestination('0OIl-not-base58')).toBeNull()
    expect(isValidMarcoDestination(evmChecksum, 'solana')).toBe(false)
    expect(destinationToBytes32(solana, 'solana')).toHaveLength(66)
  })
})

describe('shared-decimal safety', () => {
  it.each([
    ['0.000001', '1000000000000', '1000'],
    ['0.000002', '2000000000000', '2000'],
  ])('converts %s exactly without floating point', (amount, evmAmountLD, solanaAmountLD) => {
    expect(parseBridgeAmount(amount, 18)?.amountLD.toString()).toBe(evmAmountLD)
    expect(parseBridgeAmount(amount, 9)?.amountLD.toString()).toBe(solanaAmountLD)
  })

  it('does not impose an artificial MARCO amount cap above shared-decimal dust', () => {
    expect(parseBridgeAmount('1', 18)?.amountLD.toString()).toBe('1000000000000000000')
    expect(parseBridgeAmount('1000000000', 18)?.amountLD.toString()).toBe('1000000000000000000000000000')
    expect(parseBridgeAmount('1000000000', 9)?.amountLD.toString()).toBe('1000000000000000000')
  })

  it('normalizes insignificant zeros and rejects sub-shared-decimal amounts', () => {
    expect(normalizeBridgeAmount('0.0000010')).toBe('0.000001')
    expect(parseBridgeAmount('0.0000001', 18)).toBeNull()
    expect(parseBridgeAmount('1.0000001', 9)).toBeNull()
    expect(parseBridgeAmount('0', 18)).toBeNull()
  })
})
