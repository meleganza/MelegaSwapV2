import { getAddress } from '@ethersproject/address'
import type { MarcoWalletFamily } from './types'

const BASE58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

function decodeBase58(value: string): Uint8Array {
  if (!value) throw new Error('Destination wallet is required.')
  const bytes: number[] = [0]
  for (const character of value) {
    const digit = BASE58.indexOf(character)
    if (digit < 0) throw new Error('Enter a valid Solana destination wallet.')
    let carry = digit
    for (let index = 0; index < bytes.length; index += 1) {
      carry += bytes[index] * 58
      bytes[index] = carry & 0xff
      carry >>= 8
    }
    while (carry > 0) {
      bytes.push(carry & 0xff)
      carry >>= 8
    }
  }
  for (let index = 0; index < value.length - 1 && value[index] === '1'; index += 1) bytes.push(0)
  return Uint8Array.from(bytes.reverse())
}

export function validateDestinationWallet(address: string, family: MarcoWalletFamily): string {
  if (family === 'evm') {
    try {
      return getAddress(address.trim())
    } catch {
      throw new Error('Enter a valid EVM destination wallet.')
    }
  }
  const normalized = address.trim()
  if (decodeBase58(normalized).length !== 32) throw new Error('Enter a valid Solana destination wallet.')
  return normalized
}

export function solanaAddressToBytes32(address: string): Uint8Array {
  const normalized = validateDestinationWallet(address, 'solana')
  return decodeBase58(normalized)
}
