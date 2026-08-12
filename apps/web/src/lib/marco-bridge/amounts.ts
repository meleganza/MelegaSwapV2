import { BigNumber } from '@ethersproject/bignumber'
import type { CanonicalBridgeAmount } from './types'
import { MARCO_SHARED_DECIMALS } from './wave1Registry'

const TEN = BigNumber.from(10)

function pow10(decimals: number): BigNumber {
  return TEN.pow(decimals)
}

export function parseDecimalAmount(value: string, decimals: number): BigNumber {
  const normalized = value.trim()
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) throw new Error('Enter a valid MARCO amount.')
  const [whole, fraction = ''] = normalized.split('.')
  if (fraction.length > decimals) throw new Error(`MARCO supports at most ${decimals} decimals on this network.`)
  const padded = fraction.padEnd(decimals, '0')
  return BigNumber.from(whole)
    .mul(pow10(decimals))
    .add(BigNumber.from(padded || '0'))
}

export function formatDecimalAmount(value: BigNumber, decimals: number, maxFraction = 6): string {
  const base = pow10(decimals)
  const whole = value.div(base).toString()
  const fraction = value.mod(base).toString().padStart(decimals, '0').slice(0, maxFraction).replace(/0+$/, '')
  return fraction ? `${whole}.${fraction}` : whole
}

export function canonicalizeBridgeAmount(
  value: string,
  sourceDecimals: number,
  destinationDecimals: number,
): CanonicalBridgeAmount {
  if (sourceDecimals < MARCO_SHARED_DECIMALS || destinationDecimals < MARCO_SHARED_DECIMALS) {
    throw new Error('Unsafe MARCO decimal configuration.')
  }
  const requestedLD = parseDecimalAmount(value, sourceDecimals)
  if (requestedLD.isZero()) throw new Error('Enter an amount greater than zero.')
  const sourceRate = pow10(sourceDecimals - MARCO_SHARED_DECIMALS)
  const destinationRate = pow10(destinationDecimals - MARCO_SHARED_DECIMALS)
  const amountSD = requestedLD.div(sourceRate)
  if (amountSD.isZero()) throw new Error('Amount is below the minimum bridge precision.')
  const sendLD = amountSD.mul(sourceRate)
  const dustLD = requestedLD.sub(sendLD)
  const receiveLD = amountSD.mul(destinationRate)
  return {
    requestedLD,
    sendLD,
    dustLD,
    amountSD,
    receiveLD,
    sourceDecimals,
    destinationDecimals,
    sharedDecimals: MARCO_SHARED_DECIMALS,
  }
}
