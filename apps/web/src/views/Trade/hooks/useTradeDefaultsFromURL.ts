import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Field, replaceSwapState } from 'state/swap/actions'
import { queryParametersToSwapState } from 'state/swap/hooks'
import { useAppDispatch } from 'state'
import { useActiveChainId } from 'hooks/useActiveChainId'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import { NativeCurrency } from '@pancakeswap/sdk'

/** Trade page defaults — canonical MARCO/BNB when URL params are absent. */
export function useTradeDefaultsFromURL():
  | { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined }
  | undefined {
  const { chainId } = useActiveChainId()
  const dispatch = useAppDispatch()
  const native = useNativeCurrency()
  const { query } = useRouter()
  const [result, setResult] = useState<
    { inputCurrencyId: string | undefined; outputCurrencyId: string | undefined } | undefined
  >()

  useEffect(() => {
    if (!chainId || !native) return
    const nativeSymbol = NativeCurrency[chainId]
    const parsed = queryParametersToSwapState(query, nativeSymbol, MARCO_BSC_ADDRESS)

    dispatch(
      replaceSwapState({
        typedValue: parsed.typedValue,
        field: parsed.independentField,
        inputCurrencyId: parsed[Field.INPUT].currencyId,
        outputCurrencyId: parsed[Field.OUTPUT].currencyId,
        recipient: null,
      }),
    )

    setResult({
      inputCurrencyId: parsed[Field.INPUT].currencyId,
      outputCurrencyId: parsed[Field.OUTPUT].currencyId,
    })
  }, [dispatch, chainId, query, native])

  return result
}
