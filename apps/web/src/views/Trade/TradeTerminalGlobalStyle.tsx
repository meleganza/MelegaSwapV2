import { createGlobalStyle, keyframes } from 'styled-components'
import { tradeColors } from './tradeTokens'

const valueFade = keyframes`
  from { opacity: 0.7; }
  to { opacity: 1; }
`

const gridShimmer = keyframes`
  0%, 100% { opacity: 0.04; }
  50% { opacity: 0.08; }
`

const TradeTerminalGlobalStyle = createGlobalStyle`
  [data-trade-terminal-screen] {
    color: ${tradeColors.text};
    background: ${tradeColors.canvas};
  }

  [data-trade-cockpit] {
    width: 360px;
    max-width: 360px;
    overflow: hidden;
    box-sizing: border-box;
  }

  [data-trade-cockpit-shell],
  .trade-swap-cockpit {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
    position: relative;
    box-sizing: border-box;
  }

  .trade-terminal-swap {
    display: flex !important;
    flex-direction: column !important;
    min-height: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    overflow: hidden !important;
    contain: layout paint;
    box-sizing: border-box !important;
    gap: 0 !important;
  }

  .trade-terminal-swap #swap-page {
    padding: 0 !important;
    min-height: 0 !important;
    width: 100% !important;
    max-width: 100% !important;
    background: transparent !important;
    display: contents !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
    margin: 0 !important;
  }

  .trade-swap-cockpit .trade-terminal-swap [class*='gtZlyp'],
  .trade-swap-cockpit .trade-terminal-swap [class*='AutoColumn'] {
    order: 1 !important;
  }

  .trade-swap-cockpit [data-trade-route-line] {
    order: 2 !important;
    flex-shrink: 0 !important;
  }

  .trade-swap-cockpit .trade-terminal-swap [class*='AdvancedDetailsFooter'] {
    order: 3 !important;
  }

  .trade-swap-cockpit .trade-terminal-swap #swap-page > div:last-child,
  .trade-swap-cockpit .trade-terminal-swap [class*='Box'][class*='mt'] {
    order: 4 !important;
  }

  .trade-terminal-swap [class*='AutoColumn'],
  .trade-terminal-swap [class*='CurrencyInputPanel'],
  .trade-terminal-swap [class*='InputPanel'] {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }

  .trade-terminal-swap [class*='CurrencyInputHeader'],
  .trade-terminal-swap [class*='Info'],
  .trade-terminal-swap [class*='SwapUI'] {
    display: none !important;
  }

  /* Hide duplicate uikit slippage row — execution details panel is the single source */
  .trade-swap-cockpit .trade-terminal-swap #swap-currency-output + div {
    display: none !important;
    height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }

  .trade-terminal-swap #swap-currency-input,
  .trade-terminal-swap #swap-currency-output {
    background: #171717 !important;
    border: 1px solid rgba(255, 255, 255, 0.07) !important;
    border-radius: 14px !important;
    width: 100% !important;
    max-width: 100% !important;
    padding: 14px !important;
    position: relative !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
    margin: 0 !important;
  }

  .trade-terminal-swap #swap-currency-input {
    min-height: 92px !important;
    height: 92px !important;
    max-height: 92px !important;
    margin-top: 12px !important;
  }

  .trade-terminal-swap #swap-currency-output {
    min-height: 104px !important;
    height: 104px !important;
    max-height: 104px !important;
    margin-top: 0 !important;
  }

  .trade-terminal-swap #swap-currency-input::before,
  .trade-terminal-swap #swap-currency-output::before {
    position: absolute;
    top: 14px;
    left: 14px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #8a8a8a;
    z-index: 2;
    pointer-events: none;
  }

  .trade-terminal-swap #swap-currency-input::before {
    content: 'FROM';
  }

  .trade-terminal-swap #swap-currency-output::before {
    content: 'TO (Estimated)';
  }

  .trade-terminal-swap .token-amount-input,
  .trade-terminal-swap [class*='CurrencyInputPanel'] input {
    font-size: 30px !important;
    font-weight: 700 !important;
    line-height: 34px !important;
    color: #ffffff !important;
    max-width: calc(100% - 110px) !important;
    box-sizing: border-box !important;
    animation: ${valueFade} 180ms ease;
  }

  .trade-terminal-swap .open-currency-select-button,
  .trade-terminal-swap [class*='OpenCurrencySelectButton'] {
    position: absolute !important;
    right: 12px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    height: 40px !important;
    min-height: 40px !important;
    max-height: 40px !important;
    min-width: 88px !important;
    padding: 0 12px !important;
    border-radius: 12px !important;
    background: #0f0f0f !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    font-size: 15px !important;
    font-weight: 700 !important;
    box-sizing: border-box !important;
  }

  .trade-terminal-swap [class*='ArrowWrapper'],
  .trade-terminal-swap [class*='SwitchButton'] button {
    width: 34px !important;
    height: 34px !important;
    min-width: 34px !important;
    min-height: 34px !important;
    border-radius: 50% !important;
    background: #121212 !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    margin: 0 auto !important;
    position: relative !important;
    transform: none !important;
    color: ${tradeColors.goldBright} !important;
  }

  .trade-terminal-swap [class*='AutoRow'][style*='padding'] {
    min-height: 34px !important;
    max-height: 34px !important;
    height: 34px !important;
    margin: 0 auto !important;
    padding: 0 !important;
  }

  .trade-terminal-swap [class*='AdvancedDetailsFooter'] {
    display: block !important;
    width: 100% !important;
    max-width: 100% !important;
    margin: 12px 0 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
  }

  .trade-terminal-swap [class*='AdvancedSwapDetails'] {
    display: flex !important;
    flex-direction: column !important;
    gap: 0 !important;
    padding: 0 !important;
    background: transparent !important;
    border: none !important;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }

  .trade-terminal-swap [class*='AdvancedSwapDetails'] [class*='RowBetween'] {
    display: grid !important;
    grid-template-columns: 1fr auto !important;
    align-items: center !important;
    min-height: 26px !important;
    height: 26px !important;
    max-height: 26px !important;
    font-size: 12px !important;
    line-height: 26px !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
  }

  .trade-terminal-swap [class*='AdvancedSwapDetails'] span,
  .trade-terminal-swap [class*='AdvancedSwapDetails'] [class*='Text'] {
    font-size: 12px !important;
    color: #b5b5b5 !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }

  .trade-terminal-swap [class*='AdvancedSwapDetails'] [class*='RowBetween'] > :last-child {
    color: #ffffff !important;
    font-weight: 600 !important;
    text-align: right !important;
  }

  .trade-terminal-swap [class*='AdvancedSwapDetails'] [class*='RowBetween']:has([class*='Slippage']) > :last-child,
  .trade-terminal-swap [class*='AdvancedSwapDetails'] [class*='RowBetween']:last-child > :last-child {
    color: ${tradeColors.goldBright} !important;
  }

  .trade-terminal-swap .pancake-button--primary,
  .trade-terminal-swap button[id='swap-button'],
  .trade-terminal-swap [class*='CommitButton'] button,
  .trade-terminal-swap #swap-page > div:last-child button {
    height: 46px !important;
    min-height: 46px !important;
    max-height: 46px !important;
    width: 100% !important;
    max-width: 100% !important;
    border-radius: 12px !important;
    background: linear-gradient(180deg, #f4c542 0%, #d4af37 100%) !important;
    color: #050505 !important;
    font-weight: 800 !important;
    font-size: 15px !important;
    margin-top: 12px !important;
    margin-bottom: 0 !important;
    flex-shrink: 0 !important;
    box-sizing: border-box !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .trade-terminal-swap.is-smartswap [data-trade-cockpit-shell] {
    border-color: rgba(212, 175,  55, 0.35) !important;
    box-shadow: 0 0 24px rgba(212, 175, 55, 0.06) !important;
  }

  [data-trade-chart-area] {
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
    background-size: 48px 48px;
    animation: ${gridShimmer} 8s ease-in-out infinite;
  }

  @media (max-width: 767px) {
    [data-trade-cockpit] {
      width: 100%;
      max-width: 100%;
    }

    .trade-terminal-swap #swap-currency-input,
    .trade-terminal-swap #swap-currency-output {
      min-height: 86px !important;
      height: 86px !important;
      max-height: 86px !important;
    }
  }
`

export default TradeTerminalGlobalStyle
