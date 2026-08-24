import { BigNumber } from '@ethersproject/bignumber'
import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { getNow } from 'utils/getNow'
import { AppState } from '../state'
import useCurrentBlockTimestamp from './useCurrentBlockTimestamp'

// combines the block timestamp with the user setting to give the deadline that should be used for any submitted transaction
export default function useTransactionDeadline(): BigNumber | undefined {
  const ttl = useSelector<AppState, number>((state) => state.user.userDeadline)
  const blockTimestamp = useCurrentBlockTimestamp()
  return useMemo(() => {
    if (!ttl) return undefined
    const base = blockTimestamp ?? BigNumber.from(getNow())
    return base.add(ttl)
  }, [blockTimestamp, ttl])
}
