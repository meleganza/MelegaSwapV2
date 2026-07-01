import { createGlobalStyle, keyframes } from 'styled-components'
import { colors } from 'design-system/melega/tokens'

const valueFade = keyframes`
  from { opacity: 0.7; }
  to { opacity: 1; }
`

const TradeTerminalGlobalStyle = createGlobalStyle`
  [data-trade-terminal-screen] {
    color: ${colors.textPrimary};
    background: #0a0a0a;
  }

  [data-trade-cockpit] {
    width: 560px;
    max-width: 560px;
    overflow: hidden;
    box-sizing: border-box;
  }

  [data-trade-cockpit-shell] {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
    position: relative;
    box-sizing: border-box;
  }

  .trade-terminal-swap {
    display: flex !important;
    flex-direction: column !important;
    flex: 1 !important;
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
    display: flex !important;
    flex-direction: column !important;
    gap: 0 !important;
    overflow: hidden !important;
    box-sizing: border-box !important;
    margin: 0 !important;
  }

  .trade-terminal-swap [class*='AutoColumn'],
  .trade-terminal-swap [class*='CurrencyInputPanel'],
  .trade-terminal-swap [class*='InputPanel'] {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }

  .trade-terminal-swap [class*='CurrencyInputHeader'] {
    display: none !important;
  }

  .trade-terminal-swap #swap-currency-input,
  .trade-terminal-swap #swap-currency-output {
    background: #141414 !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 16px !important;
    min-height: 64px !important;
    height: 64px !important;
    max-height: 64px !important;
    width: 100% !important;
    max-width: 100% !important;
    padding: 0 !important;
    position: relative !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
    margin: 0 !important;
  }

  .trade-terminal-swap #swap-currency-input::before,
  .trade-terminal-swap #swap-currency-output::before {
    content: attr(data-trade-label);
    position: absolute;
    top: 10px;
    left: 14px;
    font-size: 11px;
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
    content: 'TO';
  }

  .trade-terminal-swap .token-amount-input,
  .trade-terminal-swap [class*='CurrencyInputPanel'] input {
    font-size: 24px !important;
    font-weight: 700 !important;
    color: #ffffff !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    animation: ${valueFade} 180ms ease;
  }

  .trade-terminal-swap .open-currency-select-button,
  .trade-terminal-swap [class*='OpenCurrencySelectButton'] {
    position: absolute !important;
    right: 12px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    max-width: calc(100% - 24px) !important;
    box-sizing: border-box !important;
  }

  .trade-terminal-swap [class*='AdvancedDetailsFooter'],
  .trade-terminal-swap [class*='AdvancedSwapDetails'] {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    overflow: hidden !important;
  }

  .trade-terminal-swap [class*='AdvancedDetailsFooter'] {
    display: block !important;
    opacity: 1 !important;
    height: auto !important;
    max-height: none !important;
    padding: 0 !important;
    margin: 8px 0 0 !important;
    overflow: hidden !important;
    position: static !important;
  }

  .trade-terminal-swap [class*='AdvancedSwapDetails'] {
    display: flex !important;
    flex-direction: column !important;
    gap: 6px !important;
    padding: 12px 14px !important;
    background: #111111 !important;
    border: 1px solid rgba(255, 255, 255, 0.06) !important;
    border-radius: 14px !important;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }

  .trade-terminal-swap [class*='AdvancedSwapDetails'] [class*='RowBetween'] {
    display: grid !important;
    grid-template-columns: 1fr auto !important;
    min-height: 18px !important;
    font-size: 13px !important;
    line-height: 18px !important;
    max-width: 100% !important;
    overflow: hidden !important;
  }

  .trade-terminal-swap [class*='AdvancedSwapDetails'] span,
  .trade-terminal-swap [class*='AdvancedSwapDetails'] [class*='Text'] {
    font-size: 13px !important;
    color: #8a8a8a !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
  }

  .trade-terminal-swap [class*='AdvancedSwapDetails'] [class*='RowBetween'] > :last-child {
    color: #ffffff !important;
    font-weight: 600 !important;
    text-align: right !important;
  }

  .trade-terminal-swap [class*='ArrowWrapper'],
  .trade-terminal-swap [class*='SwitchButton'] button {
    width: 40px !important;
    height: 40px !important;
    min-width: 40px !important;
    min-height: 40px !important;
    border-radius: 50% !important;
    background: #121212 !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    margin: 6px auto !important;
    position: relative !important;
    transform: none !important;
  }

  .trade-terminal-swap .pancake-button--primary,
  .trade-terminal-swap button[id='swap-button'],
  .trade-terminal-swap [class*='CommitButton'] button,
  .trade-terminal-swap #swap-page > div:last-child button {
    height: 44px !important;
    min-height: 44px !important;
    max-height: 44px !important;
    width: 100% !important;
    max-width: 100% !important;
    border-radius: 12px !important;
    background: linear-gradient(180deg, #f4c542 0%, #d4af37 100%) !important;
    color: #050505 !important;
    font-weight: 700 !important;
    font-size: 16px !important;
    margin-top: 8px !important;
    margin-bottom: 0 !important;
    flex-shrink: 0 !important;
    box-sizing: border-box !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
  }

  .trade-terminal-swap.is-smartswap [data-trade-cockpit-shell] {
    border-color: rgba(212, 175, 55, 0.45) !important;
    box-shadow: 0 0 32px rgba(212, 175, 55, 0.08) !important;
  }

  @media (max-width: 767px) {
    [data-trade-cockpit] {
      width: 100%;
      max-width: 100%;
    }

    .trade-terminal-swap #swap-currency-input,
    .trade-terminal-swap #swap-currency-output {
      min-height: 72px !important;
      height: 72px !important;
      max-height: 72px !important;
    }
  }
`

export default TradeTerminalGlobalStyle
