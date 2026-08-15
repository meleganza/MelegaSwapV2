import { BigNumber } from '@ethersproject/bignumber'

export function resolveTransactionDeadline(
  blockTimestamp: BigNumber | undefined,
  ttl: number,
  currentUnixSeconds = Math.floor(Date.now() / 1000),
): BigNumber | undefined {
  if (!ttl) return undefined
  if (blockTimestamp) return blockTimestamp.add(ttl)

  // A fresh wallet session can become interactive before the block timestamp
  // subscription has emitted. The router validates this Unix deadline on-chain.
  return BigNumber.from(currentUnixSeconds).add(ttl)
}
