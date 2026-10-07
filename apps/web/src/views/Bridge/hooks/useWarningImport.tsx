import { useCallback, useMemo, useState } from 'react';
import { Token } from '@pancakeswap/sdk'
import '@pancakeswap/uikit';

import { useRouter } from 'next/router'

import shouldShowSwapWarning from 'utils/shouldShowSwapWarning'

import { useAllTokens, useCurrencyBridge } from 'hooks/Tokens';
import { useDefaultsFromURLSearchBridge } from 'state/swap/hooks'
// import ImportTokenWarningModal from 'components/ImportTokenWarningModal'
import '@pancakeswap/wagmi';
import 'utils';
import useActiveWeb3React from 'hooks/useActiveWeb3React'

// import SwapWarningModal from '../components/SwapWarningModal'

export default function useWarningImport() {
  useRouter();
  const loadedUrlParams = useDefaultsFromURLSearchBridge()
  const { chainId, isWrongNetwork } = useActiveWeb3React()

  // swap warning state
  const [swapWarningCurrency, setSwapWarningCurrency] = useState(null)

  // token warning stuff
  const [loadedCurrency] = [
    useCurrencyBridge(loadedUrlParams?.inputCurrencyId),
    // useCurrency(loadedUrlParams?.outputCurrencyId),
  ]

  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedCurrency]?.filter((c): c is Token => c?.isToken) ?? [],
    [loadedCurrency],
  )

  // console.log(loadedCurrency)

  const defaultTokens = useAllTokens()



  // const [onPresentSwapWarningModal] = useModal(<SwapWarningModal swapCurrency={swapWarningCurrency} />, false)
  // const [onPresentImportTokenWarningModal] = useModal(
  //   <ImportTokenWarningModal tokens={importTokensNotInDefault} onCancel={() => router.push('/swap')} />,
  // )

  // useEffect(() => {
  //   if (swapWarningCurrency) {
  //     onPresentSwapWarningModal()
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [swapWarningCurrency])

  const swapWarningHandler = useCallback((currencyInput) => {
    const showSwapWarning = shouldShowSwapWarning(currencyInput)
    if (showSwapWarning) {
      setSwapWarningCurrency(currencyInput)
    } else {
      setSwapWarningCurrency(null)
    }
  }, [])

  // useEffect(() => {
  //   if (importTokensNotInDefault.length > 0) {
  //     onPresentImportTokenWarningModal()
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [importTokensNotInDefault.length])

  return swapWarningHandler
}
