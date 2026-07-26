import React, { useCallback, useEffect, useRef } from 'react'
import { publishSwapExperienceMode } from 'lib/smart-swap-execution-handoff'
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
import { useCurrency } from 'hooks/Tokens'
import SettingsModal from 'components/Menu/GlobalSettings/SettingsModal'
import { SettingsMode } from 'components/Menu/GlobalSettings/types'
import useTradeWarningImport from './hooks/useTradeWarningImport'
import { SmartSwapForm } from 'views/Swap/SmartSwap'
import { SmartSwapExecutionPreviewModule } from 'views/SmartSwapStudio/modules/SmartSwapExecutionPreview'
import { tradeColors, tradeLayout } from './tradeTokens'
import TradeExecutionStatusStrip from './components/TradeExecutionStatusStrip'
import TradeRouterPanel from './components/TradeRouterPanel'
import { SmartSwapHistoryModule } from 'views/SmartSwapStudio/modules/SmartSwapHistory'
import TradeLimitOrdersPanel from './components/TradeLimitOrdersPanel'
import TradeModeSelector from './components/TradeModeSelector'
import { useTradeUi } from './TradeUiContext'
import type { TradeMode } from './tradeTokens'

const Shell = styled.div`
  width: 100%;
  max-width: ${tradeLayout.cockpitWidth};
  height: 100%;
  overflow: visible;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  margin: 0 auto;

  &[data-swap-experience='smart'] {
    max-width: min(100%, ${tradeLayout.cockpitSmartWidth});
  }
`

const SmartBody = styled.div<{ $smart: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  min-width: 0;
  flex: 1;
  align-items: center;
  justify-content: flex-start;

  @media (min-width: 900px) {
    display: ${({ $smart }) => ($smart ? 'grid' : 'flex')};
    grid-template-columns: ${({ $smart }) => ($smart ? 'minmax(280px, 400px) minmax(240px, 1fr)' : 'none')};
    align-items: start;
    justify-content: center;
    gap: 14px;
  }
`

const FormColumn = styled.div`
  min-width: 0;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0 auto;
  padding: 0 4px;
  box-sizing: border-box;
  align-self: center;
`

const IntelColumn = styled.aside`
  min-width: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;

  @media (max-width: 899px) {
    order: 2;
  }
`

const Panel = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 14px 18px 16px;
  background: ${tradeColors.panelGradient};
  border: 1px solid ${tradeColors.border};
  border-radius: 18px;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
`

/** Single premium header row — no second Swap title, no subtitle. */
const CockpitHeader = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 10px;
  flex-shrink: 0;
  margin-bottom: 10px;
  width: 100%;
`

const Title = styled.h2`
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
`

const Bolt = styled.span`
  color: #f7c948;
  font-size: 18px;
  line-height: 1;
`

const TabsInline = styled.div`
  flex: 0 1 200px;
  min-width: 140px;
  max-width: 220px;
`

const PairLine = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #8a8a8a;
  white-space: nowrap;
  flex-shrink: 0;
`

const LivePill = styled.span<{ $on?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  color: ${({ $on }) => ($on ? '#22c55e' : '#9ca3af')};
  margin-left: auto;
`

const LiveDot = styled.span<{ $on?: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${({ $on }) => ($on ? '#22c55e' : '#5f5f5f')};
`

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
`

const IconBtn = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #121212;
  color: #b5b5b5;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  &:hover {
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.14);
  }

  svg {
    width: 15px;
    height: 15px;
  }
`

const SwapFormWrap = styled.div`
  width: 100%;
  max-width: 100%;
  overflow: visible;
  box-sizing: border-box;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`

const Placeholder = styled.div`
  padding: 18px;
  color: ${tradeColors.muted};
  font-size: 14px;
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

export interface TradeCockpitProps {
  mode: TradeMode
}

export const TradeCockpit: React.FC<TradeCockpitProps> = ({ mode }) => {
  const swapBodyRef = useRef<HTMLDivElement>(null)
  const { account } = useWeb3React()
  const { address: wagmiAddress } = useAccount()
  const walletConnected = Boolean(account || wagmiAddress)
  const { experience, setExperience } = useTradeUi()
  const warningSwapHandler = useTradeWarningImport()
  const { onCurrencySelection } = useSwapActionHandlers()
  const {
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const [onPresentSettingsModal] = useModal(<SettingsModal mode={SettingsMode.SWAP_LIQUIDITY} />)
  const isSmartExperience = experience === 'smart'
  const pairLabel = `${inputCurrency?.symbol ?? '—'} / ${outputCurrency?.symbol ?? '—'}`

  useEffect(() => {
    publishSwapExperienceMode(experience)
    if (typeof window === 'undefined') return
    try {
      const url = new URL(window.location.href)
      if (experience === 'instant') url.searchParams.delete('experience')
      else url.searchParams.set('experience', experience)
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
    } catch {
      /* ignore */
    }
  }, [experience])

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

  if (mode === 'history') {
    return (
      <Shell data-trade-cockpit data-smart-swap-history-mount>
        <SmartSwapHistoryModule />
      </Shell>
    )
  }

  if (mode === 'router') {
    return (
      <Shell data-trade-cockpit>
        <TradeRouterPanel />
      </Shell>
    )
  }

  if (mode === 'limit') {
    return (
      <Shell data-trade-cockpit>
        <TradeLimitOrdersPanel />
      </Shell>
    )
  }

  if (mode !== 'smartswap') {
    return (
      <Shell data-trade-cockpit>
        <Panel data-trade-cockpit-shell>
          <Placeholder>Mode coming soon</Placeholder>
        </Panel>
      </Shell>
    )
  }

  return (
    <Shell data-trade-cockpit data-swap-experience={experience} data-final-pixel="true">
      <Panel data-trade-cockpit-shell className="trade-swap-cockpit trade-cockpit">
        <CockpitHeader data-trade-cockpit-header data-premium-header="true" data-single-header-row="true">
          <Title>
            <Bolt aria-hidden>⚡</Bolt>
            Swap
          </Title>
          <TabsInline data-trade-mode-selector-slot>
            <TradeModeSelector mode={experience} onChange={setExperience} />
          </TabsInline>
          <PairLine data-swap-pair>{pairLabel}</PairLine>
          <LivePill $on={walletConnected} data-live-status>
            <LiveDot $on={walletConnected} aria-hidden />
            {walletConnected ? 'Live' : 'Offline'}
          </LivePill>
          <Toolbar data-trade-cockpit-toolbar>
            <IconBtn type="button" aria-label="Swap settings" onClick={onPresentSettingsModal}>
              <SettingsIcon />
            </IconBtn>
            <IconBtn type="button" aria-label="Refresh price" onClick={handleRefresh}>
              <RefreshIcon />
            </IconBtn>
          </Toolbar>
        </CockpitHeader>
        <TradeExecutionStatusStrip />
        <SmartBody $smart={isSmartExperience} data-smart-body={isSmartExperience ? 'true' : 'false'}>
          <FormColumn data-swap-form-column>
            <SwapFormWrap
              ref={swapBodyRef}
              className={`trade-terminal-swap${walletConnected ? '' : ' is-disconnected'} is-smartswap`}
              data-wallet-connected={walletConnected ? 'true' : 'false'}
              data-trade-swap-form
              data-swap-experience={experience}
            >
              <SmartSwapForm handleOutputSelect={handleOutputSelect} />
            </SwapFormWrap>
          </FormColumn>
          {isSmartExperience ? (
            <IntelColumn data-smart-intel-panel>
              <SmartSwapExecutionPreviewModule showSmartTransparency />
            </IntelColumn>
          ) : null}
        </SmartBody>
      </Panel>
    </Shell>
  )
}

export default TradeCockpit
