import { useMemo } from 'react'

import { useBridge} from './useContract'
import { useSingleCallResult } from '../state/multicall/hooks'

function useBridgePool(pid?: number) {
  const bridgeContract = useBridge()
  const inputs = useMemo(() => [pid], [pid])
  const poolInfo = useSingleCallResult(bridgeContract, 'poolInfo', inputs).result

  return useMemo(
    () => (poolInfo ?? undefined),
    [poolInfo],
  )
}

export default useBridgePool
