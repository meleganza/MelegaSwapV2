import { Token, CurrencyAmount } from '@pancakeswap/sdk'
import { useEffect, useMemo, useState } from 'react'

import { useTokenContract } from './useContract'
import { useSingleCallResult } from '../state/multicall/hooks'

type TokenAllowanceOptions = {
  /** Re-read while an approval transaction is pending so confirmation is reflected without the legacy block feed. */
  pollIntervalMs?: number
  /** LP removal opts into authoritative direct reads, independent of the block feed. */
  preferDirect?: boolean
}

type DirectAllowanceSnapshot = { key: string; raw: string }

/**
 * Resolve allowance from multicall with a keyed direct fallback by default.
 * LP removal can opt into direct-only reads so a frozen multicall cannot mask confirmation.
 * A missing request key (disconnected wallet / no spender) must not compare
 * `undefined === undefined` and then read `.raw` on an absent snapshot.
 */
export function resolveAllowanceRaw(
  allowance?: { toString(): string } | null,
  directAllowance?: DirectAllowanceSnapshot,
  allowanceRequestKey?: string,
  preferDirect = false,
): string | undefined {
  if (preferDirect) {
    return allowanceRequestKey && directAllowance?.key === allowanceRequestKey ? directAllowance.raw : undefined
  }
  const fromMulticall = allowance?.toString()
  if (fromMulticall != null) return fromMulticall
  if (!allowanceRequestKey || !directAllowance) return undefined
  return directAllowance.key === allowanceRequestKey ? directAllowance.raw : undefined
}

function useTokenAllowance(
  token?: Token,
  owner?: string,
  spender?: string,
  options?: TokenAllowanceOptions,
): CurrencyAmount<Token> | undefined {
  // Remove's authoritative read must use the same wallet transport as approve.
  // The public app RPC can be unavailable even after the wallet mined approval.
  // Calling allowance through a signer is read-only (eth_call), never a signature.
  const contract = useTokenContract(token?.address, options?.preferDirect ?? false)

  const inputs = useMemo(() => [owner, spender], [owner, spender])
  const allowance = useSingleCallResult(contract, 'allowance', inputs).result

  // The Redux multicall listener can remain in its initial loading state when
  // the shared block-number feed is unavailable. An approval check must never
  // depend exclusively on that feed, so read the same ERC-20 value directly
  // from the chain in parallel and use it as a persistent fallback.
  const allowanceRequestKey =
    token && owner && spender ? `${token.chainId}:${token.address}:${owner}:${spender}` : undefined
  const [directAllowance, setDirectAllowance] = useState<DirectAllowanceSnapshot | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    if (!allowanceRequestKey || !contract || !owner || !spender) return undefined

    const readDirectAllowance = async () => {
      try {
        if (options?.preferDirect && contract.signer && (await contract.signer.getChainId()) !== token?.chainId) {
          if (!cancelled) setDirectAllowance(undefined)
          return
        }
        const value = await contract.allowance(owner, spender)
        if (!cancelled) setDirectAllowance({ key: allowanceRequestKey, raw: value.toString() })
      } catch {
        // The approval hook owns the bounded fail-closed timeout. Keeping the
        // last direct result scoped by key prevents stale allowance reuse.
      }
    }

    readDirectAllowance()
    const interval = options?.pollIntervalMs
      ? window.setInterval(readDirectAllowance, options.pollIntervalMs)
      : undefined

    return () => {
      cancelled = true
      if (interval) window.clearInterval(interval)
    }
  }, [allowanceRequestKey, contract, owner, spender, options?.pollIntervalMs, options?.preferDirect, token?.chainId])

  return useMemo(() => {
    if (!token) return undefined
    const raw = resolveAllowanceRaw(allowance, directAllowance, allowanceRequestKey, options?.preferDirect)
    return raw != null ? CurrencyAmount.fromRawAmount(token, raw) : undefined
  }, [token, allowance, directAllowance, allowanceRequestKey, options?.preferDirect])
}

export default useTokenAllowance
