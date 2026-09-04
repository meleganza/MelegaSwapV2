import { TranslateFunction } from '@pancakeswap/localization'
import {
  extractSwapExecutionReason,
  mapSwapExecutionReasonToUserMessage,
} from './swapExecutionUserError'

/**
 * This is hacking out the revert reason from the ethers provider thrown error however it can.
 * This object seems to be undocumented by ethers.
 * @param error an error from the ethers provider
 * @param t Translation function
 */
export function transactionErrorToUserReadableMessage(error: any, t: TranslateFunction) {
  const reason = extractSwapExecutionReason(error)
  if (reason?.indexOf('undefined is not an object') !== -1) {
    console.error(error, reason)
  } else if (reason) {
    console.error('Swap execution revert', reason)
  }
  return mapSwapExecutionReasonToUserMessage(reason, t)
}
