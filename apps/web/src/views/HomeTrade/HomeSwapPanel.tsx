import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import styled from 'styled-components'
import { Currency } from '@pancakeswap/sdk'
import { useModal } from '@pancakeswap/uikit'
import { useWeb3React } from '@pancakeswap/wagmi'
import { useAccount } from 'wagmi'
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
import { SmartSwapExecutionPreviewModule } from 'views/SmartSwapStudio/modules/SmartSwapExecutionPreview'
import type { SwapExperienceMode } from 'views/Trade/swapExperience'
import { publishSwapExperienceMode } from 'lib/smart-swap-execution-handoff'
import SmartSwapBridgeTabs, { TradeWorkspaceTab } from 'views/MarcoBridge/SmartSwapBridgeTabs'
import { HomeSwapIconButton, HomeSwapPanelShell } from './HomeSwapPanelShell'

const MarcoBridgeWorkspace = dynamic(() => import('views/MarcoBridge/MarcoBridgeWorkspace'), {
  ssr: false,
  loading: () => null,
})

const HomeSwapStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  min-width: 0;
`

const Bolt = styled.span`
  color: #f7c948;
  font-size: 20px;
  line-height: 1;
`

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
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

const HomeSwapInner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TradeWorkspaceTab>('swap')
  const swapBodyRef = useRef<HTMLDivElement>(null)
  const { account } = useWeb3React()
  const { address: wagmiAddress } = useAccount()
  const walletConnected = Boolean(account || wagmiAddress)
  // Home promotes Smart Swap only — Instant mode selector removed from this surface.
  const experience: SwapExperienceMode = 'smart'
  const warningSwapHandler = useWarningImport()
  const { onCurrencySelection } = useSwapActionHandlers()
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const [onPresentSettingsModal] = useModal(<SettingsModal mode={SettingsMode.SWAP_LIQUIDITY} />)

  useEffect(() => {
    publishSwapExperienceMode(experience)
  }, [experience])

  const headerLeading = useMemo(() => <Bolt aria-hidden>⚡</Bolt>, [])
  const headerCenter = useMemo(() => <SmartSwapBridgeTabs active={activeTab} onChange={setActiveTab} />, [activeTab])

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
    <HomeSwapStack data-home-swap-stack data-swap-experience={experience} data-final-pixel="true">
      <HomeSwapPanelShell
        headerLeading={headerLeading}
        headerCenter={headerCenter}
        toolbar={
          activeTab === 'swap' ? (
            <>
              <HomeSwapIconButton type="button" aria-label="Swap settings" onClick={onPresentSettingsModal}>
                <SettingsIcon />
              </HomeSwapIconButton>
              <HomeSwapIconButton type="button" aria-label="Refresh price" onClick={handleRefresh}>
                <RefreshIcon />
              </HomeSwapIconButton>
            </>
          ) : null
        }
      >
        {activeTab === 'bridge' ? (
          <MarcoBridgeWorkspace />
        ) : (
          <div
            ref={swapBodyRef}
            className={`home-trade-swap${walletConnected ? '' : ' is-disconnected'}`}
            data-wallet-connected={walletConnected ? 'true' : 'false'}
            data-home-swap-panel
            data-swap-experience={experience}
          >
            <SmartSwapForm handleOutputSelect={handleOutputSelect} />
            {!walletConnected && (
              <div className="home-trade-swap-slippage-strip slippage-row" role="group" aria-label="Slippage tolerance">
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
            <SmartSwapExecutionPreviewModule mode={experience} showSmartTransparency />
          </div>
        )}
      </HomeSwapPanelShell>
    </HomeSwapStack>
  )
}

export const HomeSwapPanel: React.FC = () => (
  <SwapFeaturesProvider>
    <HomeSwapInner />
  </SwapFeaturesProvider>
)

export default HomeSwapPanel
