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
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 15a3 3 0 100-6 3 3 0 000 6z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
    />
  </svg>
)

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
    <path d="M21 12a9 9 0 11-2.64-6.36" />
    <path d="M21 3v6h-6" />
  </svg>
)

const PencilIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
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

const HomeSwapInner: React.FC = () => {
  const swapBodyRef = useRef<HTMLDivElement>(null)
  const { account } = useWeb3React()
  const warningSwapHandler = useWarningImport()
  const { onCurrencySelection } = useSwapActionHandlers()
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const [onPresentSettingsModal] = useModal(<SettingsModal mode={SettingsMode.SWAP_LIQUIDITY} />)

  const inputSymbol = inputCurrency?.symbol ?? '—'
  const outputSymbol = outputCurrency?.symbol ?? '—'

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
        className={`home-trade-swap${account ? '' : ' is-disconnected'}`}
        data-wallet-connected={account ? 'true' : 'false'}
      >
        <SmartSwapForm handleOutputSelect={handleOutputSelect} />
        {!account && (
          <div className="home-trade-swap-slippage-strip" role="group" aria-label="Slippage tolerance">
            <span className="home-trade-swap-slippage-label-row">
              <span className="home-trade-swap-execution-label">Slippage Tolerance</span>
              <button
                type="button"
                className="home-trade-swap-slippage-edit"
                aria-label="Edit slippage tolerance"
                onClick={onPresentSettingsModal}
              >
                <PencilIcon />
              </button>
            </span>
            <span className="home-trade-swap-execution-value is-slippage">0.5%</span>
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
