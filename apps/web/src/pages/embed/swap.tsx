import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { Field, replaceSwapState } from 'state/swap/actions'
import { useAppDispatch } from 'state'
import { SwapFeaturesProvider } from 'views/Swap/SwapFeaturesContext'
import TradeCockpit from 'views/Trade/TradeCockpit'
import { TradeRuntimeProvider } from 'views/Trade/tradeRuntime/TradeRuntimeContext'
import type { SmartSwapProductAction } from 'views/SmartSwapStudio/SmartSwapProductActions'
import { SUPPORT_MULTI_CHAINS } from 'config/constants/supportChains'

const Canvas = styled.main`
  min-height: 100vh;
  padding: 12px;
  background: #070808;
  box-sizing: border-box;

  [data-trade-cockpit] {
    max-width: 620px;
    margin: 0 auto;
  }

  @media (max-width: 430px) {
    [data-trade-cockpit-header] {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: end;
    }
  }
`

const SwapEmbed = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [action, setAction] = useState<SmartSwapProductAction>('swap')

  useEffect(() => {
    if (!router.isReady) return
    const input = typeof router.query.inputCurrency === 'string' ? router.query.inputCurrency : 'BNB'
    const output = typeof router.query.outputCurrency === 'string' ? router.query.outputCurrency : undefined
    if (!output) return
    dispatch(
      replaceSwapState({ typedValue: '', field: Field.INPUT, inputCurrencyId: input, outputCurrencyId: output, recipient: null }),
    )
  }, [dispatch, router.isReady, router.query.inputCurrency, router.query.outputCurrency])

  return (
    <Canvas data-melega-widget="smart-swap">
      <SwapFeaturesProvider>
        <TradeRuntimeProvider>
          <TradeCockpit productAction={action} onProductActionChange={setAction} />
        </TradeRuntimeProvider>
      </SwapFeaturesProvider>
    </Canvas>
  )
}

SwapEmbed.hideMenu = true
SwapEmbed.chains = SUPPORT_MULTI_CHAINS

export default SwapEmbed
