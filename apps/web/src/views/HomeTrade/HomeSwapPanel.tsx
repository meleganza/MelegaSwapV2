import React, { useCallback, useMemo, useRef } from 'react'
import styled from 'styled-components'
import { Currency } from '@pancakeswap/sdk'
import { useModal } from '@pancakeswap/uikit'
import { useWeb3React } from '@pancakeswap/wagmi'
import { useSwapActionHandlers } from 'state/swap/useSwapActionHandlers'
import { currencyId } from 'utils/currencyId'
import replaceBrowserHistory from '@pancakeswap/utils/replaceBrowserHistory'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import { useCurrency } from 'hooks/Tokens'
import SettingsModal from 'components/Menu/GlobalSettings/SettingsModal'
import { SettingsMode } from 'components/Menu/GlobalSettings/types'
import useWarningImport from 'views/Swap/hooks/useWarningImport'
import { SmartSwapForm } from 'views/Swap/SmartSwap'
import { SwapFeaturesProvider } from 'views/Swap/SwapFeaturesContext'
import { MelegaSwapPanelShell, SwapIconButton, colors } from 'design-system/melega'

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 6.34l1.41 1.41M16.24 16.24l1.41 1.41" />
  </svg>
)

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
    <path d="M21 12a9 9 0 11-2.64-6.36" />
    <path d="M21 3v6h-6" />
  </svg>
)

const PairLine = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #8a8a8a;
  line-height: 1.2;
  white-space: nowrap;
`

const LiveDot = styled.span<{ $live?: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ $live }) => ($live ? colors.green : '#5f5f5f')};
  flex-shrink: 0;
`

const LiveText = styled.span<{ $live?: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${({ $live }) => ($live ? '#8a8a8a' : '#5f5f5f')};
`

const DISCONNECTED_EXECUTION_ROWS = [
  { label: 'Estimated received', value: '—' },
  { label: 'Price impact', value: '—' },
  { label: 'Route', value: '—' },
  { label: 'Slippage tolerance', value: '0.5%', slippage: true },
] as const

const HomeSwapInner: React.FC = () => {
  const swapBodyRef = useRef<HTMLDivElement>(null)
  const { account } = useWeb3React()
  const warningSwapHandler = useWarningImport()
  const { onCurrencySelection } = useSwapActionHandlers()
  const {
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const [onPresentSettingsModal] = useModal(<SettingsModal mode={SettingsMode.SWAP_LIQUIDITY} />)

  const inputSymbol = inputCurrency?.symbol ?? '—'
  const outputSymbol = outputCurrency?.symbol ?? '—'

  const showExecutionFallback = !account || !typedValue

  const pairIndicator = useMemo(
    () => (
      <>
        <PairLine>
          {inputSymbol} / {outputSymbol}
        </PairLine>
        <span style={{ color: '#5f5f5f', fontSize: 12 }}>•</span>
        <LiveDot $live={Boolean(account)} aria-hidden />
        <LiveText $live={Boolean(account)}>Live</LiveText>
      </>
    ),
    [account, inputSymbol, outputSymbol],
  )

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
      pairIndicator={pairIndicator}
      toolbar={
        <>
          <SwapIconButton type="button" aria-label="Swap settings" onClick={onPresentSettingsModal}>
            <SettingsIcon />
          </SwapIconButton>
          <SwapIconButton type="button" aria-label="Refresh price" onClick={handleRefresh}>
            <RefreshIcon />
          </SwapIconButton>
        </>
      }
    >
      <div
        ref={swapBodyRef}
        className={`home-trade-swap${account ? '' : ' is-disconnected'}${showExecutionFallback ? ' show-execution-fallback' : ''}`}
        data-wallet-connected={account ? 'true' : 'false'}
      >
        <SmartSwapForm handleOutputSelect={handleOutputSelect} />
        {showExecutionFallback && (
          <div className="home-trade-swap-execution-summary" aria-hidden>
            {DISCONNECTED_EXECUTION_ROWS.map((row) => (
              <div key={row.label} className="home-trade-swap-execution-row">
                <span className="home-trade-swap-execution-label">{row.label}</span>
                <span className={`home-trade-swap-execution-value${'slippage' in row && row.slippage ? ' is-slippage' : ''}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        )}
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
