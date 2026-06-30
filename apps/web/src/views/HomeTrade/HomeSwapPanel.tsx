import React, { useCallback, useRef } from 'react'
import { Currency } from '@pancakeswap/sdk'
import { useModal } from '@pancakeswap/uikit'
import { useSwapActionHandlers } from 'state/swap/useSwapActionHandlers'
import { currencyId } from 'utils/currencyId'
import replaceBrowserHistory from '@pancakeswap/utils/replaceBrowserHistory'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import SettingsModal from 'components/Menu/GlobalSettings/SettingsModal'
import { SettingsMode } from 'components/Menu/GlobalSettings/types'
import useWarningImport from 'views/Swap/hooks/useWarningImport'
import { SmartSwapForm } from 'views/Swap/SmartSwap'
import { SwapFeaturesProvider } from 'views/Swap/SwapFeaturesContext'
import { MelegaButton, MelegaSwapPanelShell } from 'design-system/melega'

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width={20} height={20}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 6.34l1.41 1.41M16.24 16.24l1.41 1.41" />
  </svg>
)

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" width={20} height={20}>
    <path d="M21 12a9 9 0 11-2.64-6.36" />
    <path d="M21 3v6h-6" />
  </svg>
)

const HomeSwapInner: React.FC = () => {
  const swapBodyRef = useRef<HTMLDivElement>(null)
  const warningSwapHandler = useWarningImport()
  const { onCurrencySelection } = useSwapActionHandlers()
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const [onPresentSettingsModal] = useModal(<SettingsModal mode={SettingsMode.SWAP_LIQUIDITY} />)

  const handleOutputSelect = useCallback(
    (newCurrencyOutput: Currency) => {
      onCurrencySelection(Field.OUTPUT, newCurrencyOutput)
      warningSwapHandler(newCurrencyOutput)
      const newCurrencyOutputId = currencyId(newCurrencyOutput)
      if (newCurrencyOutputId === inputCurrencyId) {
        replaceBrowserHistory('inputCurrency', outputCurrencyId)
      }
      replaceBrowserHistory('outputCurrency', newCurrencyOutputId)
    },
    [inputCurrencyId, outputCurrencyId, onCurrencySelection, warningSwapHandler],
  )

  const handleRefresh = useCallback(() => {
    const root = swapBodyRef.current
    if (!root) return
    const btn =
      root.querySelector('[class*="RefreshIcon"]') ||
      root.querySelector('button[aria-label*="Refresh"]') ||
      root.querySelector('[class*="CurrencyInputHeader"] button')
    if (btn instanceof HTMLElement) btn.click()
  }, [])

  return (
    <MelegaSwapPanelShell
      toolbar={
        <>
          <MelegaButton
            variant="ghost"
            aria-label="Swap settings"
            onClick={onPresentSettingsModal}
            padding="0"
            style={{ width: 34, height: 34, minHeight: 34 }}
          >
            <SettingsIcon />
          </MelegaButton>
          <MelegaButton
            variant="ghost"
            aria-label="Refresh price"
            onClick={handleRefresh}
            padding="0"
            style={{ width: 34, height: 34, minHeight: 34 }}
          >
            <RefreshIcon />
          </MelegaButton>
        </>
      }
    >
      <div ref={swapBodyRef} className="home-trade-swap">
        <SmartSwapForm handleOutputSelect={handleOutputSelect} />
      </div>
    </MelegaSwapPanelShell>
  )
}

export const HomeSwapPanel: React.FC = () => (
  <SwapFeaturesProvider>
    <HomeSwapInner />
  </SwapFeaturesProvider>
)

export default HomeSwapPanel
