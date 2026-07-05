import { useCallback, useEffect, useMemo, useState } from 'react'
import { Token } from '@pancakeswap/sdk'
import { useModal } from '@pancakeswap/uikit'
import { useRouter } from 'next/router'
import shouldShowSwapWarning from 'utils/shouldShowSwapWarning'
import { useCurrency, useAllTokens } from 'hooks/Tokens'
import ImportTokenWarningModal from 'components/ImportTokenWarningModal'
import { isAddress } from 'utils'
import SwapWarningModal from 'views/Swap/components/SwapWarningModal'
import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { useTradeDefaultsFromURL } from './useTradeDefaultsFromURL'

export default function useTradeWarningImport() {
  const router = useRouter()
  const loadedUrlParams = useTradeDefaultsFromURL()
  const { chainId, isWrongNetwork } = useActiveWeb3React()

  const [swapWarningCurrency, setSwapWarningCurrency] = useState(null)

  const [loadedInputCurrency, loadedOutputCurrency] = [
    useCurrency(loadedUrlParams?.inputCurrencyId),
    useCurrency(loadedUrlParams?.outputCurrencyId),
  ]

  const urlLoadedTokens: Token[] = useMemo(
    () => [loadedInputCurrency, loadedOutputCurrency]?.filter((c): c is Token => c?.isToken) ?? [],
    [loadedInputCurrency, loadedOutputCurrency],
  )

  const defaultTokens = useAllTokens()

  const importTokensNotInDefault =
    !isWrongNetwork && urlLoadedTokens
      ? urlLoadedTokens.filter((token: Token) => {
          const checksummedAddress = isAddress(token.address) || ''
          return !(
            checksummedAddress in defaultTokens ||
            token.address === '0x144F6D1945DC54a8198D4a54D4b346a2170126c6'
          ) && token.chainId === chainId
        })
      : []

  const [onPresentSwapWarningModal] = useModal(<SwapWarningModal swapCurrency={swapWarningCurrency} />, false)
  const [onPresentImportTokenWarningModal] = useModal(
    <ImportTokenWarningModal tokens={importTokensNotInDefault} onCancel={() => router.push('/trade')} />,
  )

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
