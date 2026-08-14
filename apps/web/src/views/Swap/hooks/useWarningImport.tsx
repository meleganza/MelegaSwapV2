import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useModal } from '@pancakeswap/uikit'
import shouldShowSwapWarning from 'utils/shouldShowSwapWarning'
import { useDefaultsFromURLSearch } from 'state/swap/hooks'

const SwapWarningModal = dynamic(() => import('../components/SwapWarningModal'), { ssr: false })

export default function useWarningImport() {
  useDefaultsFromURLSearch()

  // swap warning state
  const [swapWarningCurrency, setSwapWarningCurrency] = useState(null)

  const [onPresentSwapWarningModal] = useModal(<SwapWarningModal swapCurrency={swapWarningCurrency} />, false)

  useEffect(() => {
    if (swapWarningCurrency) {
      onPresentSwapWarningModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapWarningCurrency])

  const swapWarningHandler = useCallback((currencyInput) => {
    const showSwapWarning = shouldShowSwapWarning(currencyInput)
    if (showSwapWarning) {
      setSwapWarningCurrency(currencyInput)
    } else {
      setSwapWarningCurrency(null)
    }
  }, [])

  return swapWarningHandler
}
