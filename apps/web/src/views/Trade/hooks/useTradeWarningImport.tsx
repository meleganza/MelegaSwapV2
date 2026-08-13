import { useCallback, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useModal } from '@pancakeswap/uikit'
import shouldShowSwapWarning from 'utils/shouldShowSwapWarning'
import { useTradeDefaultsFromURL } from './useTradeDefaultsFromURL'

const SwapWarningModal = dynamic(() => import('views/Swap/components/SwapWarningModal'), { ssr: false })

export default function useTradeWarningImport() {
  useTradeDefaultsFromURL()

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
