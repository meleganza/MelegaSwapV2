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
  .trade-terminal-swap [class*='HeaderWrapper'],
  .trade-terminal-swap > [class*='HeaderWrapper'],
  .trade-terminal-swap > div:first-child:not([data-trade-route-line]),
  .trade-terminal-swap [class*='GlobalSettings'],
  .trade-terminal-swap #open-settings-dialog-button-SWAP_LIQUIDITY,
  .trade-terminal-swap [class*='IconButton'],
  .trade-terminal-swap [class*='Info'],
  .trade-terminal-swap [class*='SwapUI'] {
    display: none !important;
    height: 0 !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }

  .trade-swap-cockpit [data-trade-cockpit-toolbar] button {
    display: inline-flex !important;
    visibility: visible !important;
    pointer-events: auto !important;
    height: 34px !important;
    min-height: 34px !important;
    width: 34px !important;
    overflow: visible !important;
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

  .trade-cockpit [data-native-label],
  .trade-cockpit .native-label,
  .trade-cockpit .token-amount-tooltip,
  .trade-cockpit .swap-form-label:not(.trade-controlled-label) {
    display: none !important;
  }

  .trade-cockpit .trade-terminal-swap #swap-currency-input > div:first-of-type,
  .trade-cockpit .trade-terminal-swap #swap-currency-output > div:first-of-type,
  .trade-cockpit .trade-terminal-swap [class*='LabelRow'],
  .trade-cockpit .trade-terminal-swap #swap-currency-input [class*='LabelRow'],
  .trade-cockpit .trade-terminal-swap #swap-currency-output [class*='LabelRow'] {
    display: none !important;
    height: 0 !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }

  .trade-cockpit .trade-terminal-swap .token-amount-input[title],
  .trade-cockpit .trade-terminal-swap input[title] {
    pointer-events: auto !important;
  }

  .trade-cockpit .trade-terminal-swap .token-amount-input[title]::after,
  .trade-cockpit .trade-terminal-swap input[title]::before {
    display: none !important;
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
    min-height: 84px !important;
    height: 84px !important;
    max-height: 84px !important;
    margin-top: 0 !important;
  }

  .trade-terminal-swap #swap-currency-output {
    min-height: 84px !important;
    height: 84px !important;
    max-height: 84px !important;
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
    line-height: 10px;
    z-index: 2;
    pointer-events: none;
  }

  .trade-terminal-swap #swap-currency-input [class*='InputContainer'],
  .trade-terminal-swap #swap-currency-output [class*='InputContainer'] {
    position: absolute !important;
    left: 14px !important;
    right: 112px !important;
    bottom: 14px !important;
    top: auto !important;
    height: 32px !important;
    min-height: 32px !important;
    max-height: 32px !important;
    padding: 0 !important;
    background: transparent !important;
    border: none !important;
  }

  .trade-terminal-swap #swap-currency-input [class*='CurrencyInputHeader'],
  .trade-terminal-swap #swap-currency-output [class*='CurrencyInputHeader'],
  .trade-terminal-swap #swap-currency-input [class*='LabelRow'],
  .trade-terminal-swap #swap-currency-output [class*='LabelRow'],
  .trade-terminal-swap [class*='CurrencyInputPanel'] > label,
  .trade-terminal-swap [class*='InputPanel'] > label,
  .trade-terminal-swap #swap-currency-input > div:first-of-type,
  .trade-terminal-swap #swap-currency-output > div:first-of-type {
    display: none !important;
    height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    visibility: hidden !important;
  }

  .trade-terminal-swap #swap-currency-input [class*='InputContainer'] [class*='Text'],
  .trade-terminal-swap #swap-currency-output [class*='InputContainer'] [class*='Text'],
  .trade-terminal-swap #swap-currency-input [class*='InputContainer'] span:not(:first-child),
  .trade-terminal-swap #swap-currency-output [class*='InputContainer'] span:not(:first-child) {
    display: none !important;
  }

  .trade-terminal-swap #swap-currency-input::before {
    content: 'FROM';
  }

  .trade-terminal-swap #swap-currency-output::before {
    content: 'TO (ESTIMATED)';
  }

  .trade-terminal-swap .token-amount-input,
  .trade-terminal-swap [class*='CurrencyInputPanel'] input {
    font-size: 32px !important;
    font-weight: 700 !important;
    line-height: 32px !important;
    height: 32px !important;
    min-height: 32px !important;
    max-height: 32px !important;
    color: #ffffff !important;
    max-width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
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
    width: 30px !important;
    height: 30px !important;
    min-width: 30px !important;
    min-height: 30px !important;
    border-radius: 50% !important;
    background: #121212 !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    margin: 0 auto !important;
    position: relative !important;
    transform: none !important;
    color: ${tradeColors.goldBright} !important;
    transition: transform 120ms ease !important;
  }

  .trade-terminal-swap [class*='ArrowWrapper'] button:active,
  .trade-terminal-swap [class*='SwitchButton'] button:active {
    transform: scale(0.99) !important;
  }

  .trade-terminal-swap [class*='AutoRow'][style*='padding'] {
    min-height: 30px !important;
    max-height: 30px !important;
    height: 30px !important;
    margin: 10px auto !important;
    padding: 0 !important;
  }

  .trade-cockpit .trade-terminal-swap #swap-currency-input {
    margin-top: 0 !important;
  }

  .trade-cockpit .trade-terminal-swap #swap-currency-output {
    margin-top: 10px !important;
  }

  .trade-swap-cockpit [data-trade-route-line] {
    margin-top: 12px !important;
    min-height: 54px !important;
    height: 54px !important;
    max-height: 54px !important;
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
    min-height: 28px !important;
    height: 28px !important;
    max-height: 28px !important;
    font-size: 12px !important;
    line-height: 28px !important;
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
    margin-top: 10px !important;
    margin-bottom: 0 !important;
    flex-shrink: 0 !important;
    box-sizing: border-box !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    transition: transform 150ms ease, filter 150ms ease !important;
  }

  .trade-terminal-swap .pancake-button--primary:hover,
  .trade-terminal-swap button[id='swap-button']:hover,
  .trade-terminal-swap [class*='CommitButton'] button:hover,
  .trade-terminal-swap #swap-page > div:last-child button:hover {
    filter: brightness(1.05) !important;
    transform: translateY(-1px) scale(1.01) !important;
    transition: transform 140ms ease, filter 140ms ease !important;
  }

  .trade-terminal-swap .pancake-button--primary:active,
  .trade-terminal-swap button[id='swap-button']:active,
  .trade-terminal-swap [class*='CommitButton'] button:active,
  .trade-terminal-swap #swap-page > div:last-child button:active {
    transform: scale(0.99) !important;
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
    filter: brightness(1.06);
  }

  [data-trade-price-chart]:hover [data-trade-chart-area] {
    filter: brightness(1.06);
  }

  [data-trade-price-chart] [class*='StatCard']:hover,
  [data-trade-price-chart] [data-trade-pair-stats] > div:hover {
    box-shadow: 0 10px 24px rgba(212, 175, 55, 0.08);
  }

  @media (max-width: 767px) {
    [data-trade-cockpit] {
      width: 100%;
      max-width: 100%;
    }

    .trade-terminal-swap #swap-currency-input,
    .trade-terminal-swap #swap-currency-output {
      min-height: 84px !important;
      height: 84px !important;
      max-height: 84px !important;
    }
  }
`

export default TradeTerminalGlobalStyle
