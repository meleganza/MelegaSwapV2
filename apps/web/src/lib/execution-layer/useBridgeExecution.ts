import { useCallback, useMemo } from 'react'
import { useWeb3React } from '@pancakeswap/wagmi'

import { useActiveChainId } from 'hooks/useActiveChainId'
import useBurnToken from 'views/Bridge/hooks/useBurnToken'

import { trackExecutionSubmission } from '../execution-tracker/trackExecution'
import { useExecutionTrackerReceiptSync } from '../execution-tracker/useExecutionTrackerReceiptSync'
import type { BridgeExecutionInstruction } from './types'

/**
 * Bridge execution adapter — dispatches burn/burnETH via existing hook.
 * Routing (pid, amount, native flag) is supplied by instruction only.
 */
export function useBridgeExecution(instruction: BridgeExecutionInstruction | null) {
  const { account } = useWeb3React()
  const { chainId } = useActiveChainId()
  const { onStake } = useBurnToken(instruction?.pid ?? 0, instruction?.isNative ?? false)

  useExecutionTrackerReceiptSync(instruction)

  const execute = useCallback(
    async (amount?: string) => {
      if (!instruction) {
        throw new Error('Missing bridge execution instruction')
      }

      return trackExecutionSubmission(
        instruction,
        () => onStake(amount ?? instruction.amount),
        { account: account ?? undefined, chainId },
      )
    },
    [instruction, onStake, account, chainId],
  )

  return useMemo(
    () => ({
      instructionId: instruction?.id ?? '',
      execute,
    }),
    [instruction?.id, execute],
  )
}
