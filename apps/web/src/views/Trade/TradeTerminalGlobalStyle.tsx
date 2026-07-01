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

  .trade-terminal-swap {
    display: flex !important;
    flex-direction: column !important;
    flex: 1 !important;
    min-height: 0 !important;
    gap: 12px !important;
  }

  .trade-terminal-swap #swap-page {
    padding: 0 !important;
    min-height: 0 !important;
    background: transparent !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 12px !important;
  }

  .trade-terminal-swap [class*='CurrencyInputHeader'] {
    display: none !important;
  }

  .trade-terminal-swap #swap-currency-input,
  .trade-terminal-swap #swap-currency-output {
    background: #141414 !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 16px !important;
    min-height: 88px !important;
    height: 88px !important;
    padding: 0 !important;
    position: relative !important;
  }

  .trade-terminal-swap #swap-currency-input::before,
  .trade-terminal-swap #swap-currency-output::before {
    content: attr(data-trade-label);
    position: absolute;
    top: 14px;
    left: 16px;
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
    font-size: 32px !important;
    font-weight: 700 !important;
    color: #ffffff !important;
    animation: ${valueFade} 180ms ease;
  }

  .trade-terminal-swap [class*='AdvancedDetailsFooter'] {
    display: block !important;
    opacity: 1 !important;
    height: auto !important;
    max-height: none !important;
    padding: 0 !important;
    margin: 0 !important;
    overflow: visible !important;
    position: static !important;
  }

  .trade-terminal-swap [class*='AdvancedSwapDetails'] {
    display: flex !important;
    flex-direction: column !important;
    gap: 8px !important;
    padding: 14px 16px !important;
    background: #111111 !important;
    border: 1px solid rgba(255, 255, 255, 0.06) !important;
    border-radius: 14px !important;
  }

  .trade-terminal-swap [class*='AdvancedSwapDetails'] [class*='RowBetween'] {
    display: grid !important;
    grid-template-columns: 1fr auto !important;
    min-height: 18px !important;
    font-size: 13px !important;
    line-height: 18px !important;
  }

  .trade-terminal-swap [class*='AdvancedSwapDetails'] span,
  .trade-terminal-swap [class*='AdvancedSwapDetails'] [class*='Text'] {
    font-size: 13px !important;
    color: #8a8a8a !important;
  }

  .trade-terminal-swap [class*='AdvancedSwapDetails'] [class*='RowBetween'] > :last-child {
    color: #ffffff !important;
    font-weight: 600 !important;
    text-align: right !important;
  }

  .trade-terminal-swap [class*='ArrowWrapper'],
  .trade-terminal-swap [class*='SwitchButton'] button {
    width: 44px !important;
    height: 44px !important;
    min-width: 44px !important;
    min-height: 44px !important;
    border-radius: 50% !important;
    background: #121212 !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    margin: -6px auto !important;
  }

  .trade-terminal-swap .pancake-button--primary,
  .trade-terminal-swap button[id='swap-button'],
  .trade-terminal-swap [class*='CommitButton'] button,
  .trade-terminal-swap #swap-page > div:last-child button {
    height: 52px !important;
    min-height: 52px !important;
    max-height: 52px !important;
    width: 100% !important;
    border-radius: 14px !important;
    background: linear-gradient(180deg, #f4c542 0%, #d4af37 100%) !important;
    color: #050505 !important;
    font-weight: 700 !important;
    font-size: 16px !important;
    margin-top: 4px !important;
    margin-bottom: 0 !important;
    flex-shrink: 0 !important;
  }

  .trade-terminal-swap.is-smartswap [data-trade-cockpit-shell] {
    border-color: rgba(212, 175, 55, 0.45) !important;
    box-shadow: 0 0 32px rgba(212, 175, 55, 0.08) !important;
  }

  @media (max-width: 767px) {
    .trade-terminal-swap #swap-currency-input,
    .trade-terminal-swap #swap-currency-output {
      min-height: 80px !important;
      height: 80px !important;
    }
  }
`

export default TradeTerminalGlobalStyle
