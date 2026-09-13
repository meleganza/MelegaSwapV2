import { Token, CurrencyAmount } from '@pancakeswap/sdk'
import { useEffect, useMemo, useState } from 'react'

import { useTokenContract } from './useContract'
import { useSingleCallResult } from '../state/multicall/hooks'

type TokenAllowanceOptions = {
  /** Re-read while an approval transaction is pending so confirmation is reflected without the legacy block feed. */
  pollIntervalMs?: number
}

type DirectAllowanceSnapshot = { key: string; raw: string }

/**
 * Resolve ERC-20 allowance raw units from multicall, then the keyed direct read.
 * A missing request key (disconnected wallet / no spender) must not compare
 * `undefined === undefined` and then read `.raw` on an absent snapshot.
 */
export function resolveAllowanceRaw(
  allowance?: { toString(): string } | null,
  directAllowance?: DirectAllowanceSnapshot,
  allowanceRequestKey?: string,
): string | undefined {
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
  const contract = useTokenContract(token?.address, false)

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

    const readDirectAllowance = () => {
      void contract
        .allowance(owner, spender)
        .then((value) => {
          if (!cancelled) setDirectAllowance({ key: allowanceRequestKey, raw: value.toString() })
        })
        .catch(() => {
          // The approval hook owns the bounded fail-closed timeout. Keeping the
          // last direct result scoped by key prevents stale allowance reuse.
        })
    }

    readDirectAllowance()
    const interval = options?.pollIntervalMs
      ? window.setInterval(readDirectAllowance, options.pollIntervalMs)
      : undefined

    return () => {
      cancelled = true
      if (interval) window.clearInterval(interval)
    }
  }, [allowanceRequestKey, contract, owner, spender, options?.pollIntervalMs])

  return useMemo(() => {
    if (!token) return undefined
    const raw = resolveAllowanceRaw(allowance, directAllowance, allowanceRequestKey)
    return raw != null ? CurrencyAmount.fromRawAmount(token, raw) : undefined
  }, [token, allowance, directAllowance, allowanceRequestKey])
}

export default useTokenAllowance
