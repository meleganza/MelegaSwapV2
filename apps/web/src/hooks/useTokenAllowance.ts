import { Token, CurrencyAmount } from '@pancakeswap/sdk'
import { useEffect, useMemo, useState } from 'react'

import { useTokenContract } from './useContract'
import { useSingleCallResult } from '../state/multicall/hooks'

function useTokenAllowance(token?: Token, owner?: string, spender?: string): CurrencyAmount<Token> | undefined {
  const contract = useTokenContract(token?.address, false)

  const inputs = useMemo(() => [owner, spender], [owner, spender])
  const allowance = useSingleCallResult(contract, 'allowance', inputs).result

  // The Redux multicall listener can remain in its initial loading state when
  // the shared block-number feed is unavailable. An approval check must never
  // depend exclusively on that feed, so read the same ERC-20 value directly
  // from the chain in parallel and use it as a persistent fallback.
  const allowanceRequestKey =
    token && owner && spender ? `${token.chainId}:${token.address}:${owner}:${spender}` : undefined
  const [directAllowance, setDirectAllowance] = useState<{ key: string; raw: string } | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    if (!allowanceRequestKey || !contract || !owner || !spender) return undefined

    void contract
      .allowance(owner, spender)
      .then((value) => {
        if (!cancelled) setDirectAllowance({ key: allowanceRequestKey, raw: value.toString() })
      })
      .catch(() => {
        // The approval hook owns the bounded fail-closed timeout. Keeping the
        // last direct result scoped by key prevents stale allowance reuse.
      })

    return () => {
      cancelled = true
    }
  }, [allowanceRequestKey, contract, owner, spender])

  return useMemo(
    () => {
      if (!token) return undefined
      const raw =
        allowance?.toString() ?? (directAllowance?.key === allowanceRequestKey ? directAllowance.raw : undefined)
      return raw != null ? CurrencyAmount.fromRawAmount(token, raw) : undefined
    },
    [token, allowance, directAllowance, allowanceRequestKey],
  )
}

export default useTokenAllowance
