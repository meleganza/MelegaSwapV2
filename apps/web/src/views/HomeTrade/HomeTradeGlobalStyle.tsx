import { createGlobalStyle, keyframes } from 'styled-components'
import { colors } from 'design-system/melega/tokens'

const swapValueFade = keyframes`
  from { opacity: 0.7; }
  to { opacity: 1; }
`

const swapArrowPulse = keyframes`
  0% { transform: rotate(180deg) scale(1); }
  50% { transform: rotate(180deg) scale(0.92); }
  100% { transform: rotate(180deg) scale(1); }
`

const HomeTradeGlobalStyle = createGlobalStyle`
  .home-trade-swap [class*='HeaderWrapper'],
  .home-trade-swap > div > div:first-child:not(#swap-page) {
    display: none !important;
    height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    overflow: hidden !important;
  }

  .home-trade-swap #swap-page {
    padding: 0 !important;
    min-height: 0 !important;
    max-height: none !important;
    background: transparent !important;
    overflow: visible !important;
    margin-top: 0 !important;
    display: flex !important;
    flex-direction: column !important;
    flex: 1 !important;
  }

  .home-trade-swap #swap-page[style*='min-height'] {
    min-height: 0 !important;
  }

  .home-trade-swap {
    position: relative;
  }

  .home-trade-swap.is-disconnected input,
  .home-trade-swap.is-disconnected .token-amount-input {
    pointer-events: none !important;
    opacity: 0.45 !important;
  }

  .home-trade-swap.is-disconnected .open-currency-select-button,
  .home-trade-swap.is-disconnected [class*='OpenCurrencySelectButton'] {
    pointer-events: none !important;
    opacity: 0.5 !important;
  }

  .home-trade-swap.is-disconnected [class*='SwitchButton'] button {
    pointer-events: none !important;
    opacity: 0.4 !important;
  }

  .home-trade-swap-execution-summary {
    display: none;
  }

  .home-trade-swap.show-execution-fallback .home-trade-swap-execution-summary {
    display: flex;
    flex-direction: column;
    gap: 2px;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 54px;
    padding: 0;
    pointer-events: none;
  }

  .home-trade-swap-execution-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 15px;
    font-size: 13px;
    line-height: 1.25;
  }

  .home-trade-swap-execution-row span:first-child {
    color: #8a8a8a;
    font-weight: 500;
  }

  .home-trade-swap-execution-row span:last-child {
    color: #ffffff;
    font-weight: 600;
  }

  .home-trade-swap.is-disconnected [class*='ConnectWallet'],
  .home-trade-swap.is-disconnected a[class*='ConnectWallet'],
  .home-trade-swap.is-disconnected button[class*='pancake-button']:only-child {
    height: 48px !important;
    min-height: 48px !important;
    max-height: 48px !important;
    width: 100% !important;
    border-radius: 12px !important;
    background: linear-gradient(180deg, #f4c542 0%, #d4af37 100%) !important;
    color: #000000 !important;
    font-weight: 700 !important;
    font-size: 16px !important;
    border: none !important;
    box-shadow: none !important;
    opacity: 0.72 !important;
    pointer-events: auto !important;
    transition: filter 150ms ease, transform 150ms ease, opacity 150ms ease !important;
  }

  .home-trade-swap.is-disconnected [class*='ConnectWallet']:hover,
  .home-trade-swap.is-disconnected button[class*='pancake-button']:only-child:hover {
    filter: brightness(1.06) !important;
    transform: translateY(-1px) !important;
    opacity: 0.9 !important;
  }

  .home-trade-swap.is-disconnected [class*='ConnectWallet']:active,
  .home-trade-swap.is-disconnected button[class*='pancake-button']:only-child:active {
    transform: scale(0.99) !important;
  }

  .home-trade-swap [class*='CurrencyInputHeader'] button:not([class*='OpenCurrencySelectButton']),
  .home-trade-swap #open-settings-dialog-button-SWAP_LIQUIDITY,
  .home-trade-swap [class*='RefreshIcon'],
  .home-trade-swap button[aria-label*='Refresh'] {
    display: none !important;
  }

  .home-trade-swap [class*='AutoColumn'] {
    gap: 0 !important;
  }

  .home-trade-swap #swap-page > div:first-of-type {
    flex: 1 1 auto !important;
    min-height: 0 !important;
    overflow: visible !important;
    display: flex !important;
    flex-direction: column !important;
  }

  .home-trade-swap #swap-page > div:last-child {
    flex: 0 0 auto !important;
    margin-top: auto !important;
  }

  .home-trade-swap #swap-currency-input,
  .home-trade-swap #swap-currency-output {
    position: relative !important;
    display: block !important;
    visibility: visible !important;
    background: #171717 !important;
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
    border-radius: 14px !important;
    padding: 10px 14px !important;
    height: 72px !important;
    min-height: 72px !important;
    max-height: 72px !important;
    overflow: hidden !important;
    margin-top: 6px !important;
    box-sizing: border-box !important;
    box-shadow: none !important;
  }

  .home-trade-swap #swap-currency-input:first-of-type {
    margin-top: 0 !important;
  }

  .home-trade-swap #swap-currency-input > div:first-of-type,
  .home-trade-swap #swap-currency-output > div:first-of-type {
    position: absolute !important;
    top: 10px !important;
    left: 14px !important;
    right: 110px !important;
    padding: 0 !important;
    margin: 0 !important;
    z-index: 2 !important;
  }

  .home-trade-swap #swap-currency-input > div:nth-of-type(2),
  .home-trade-swap #swap-currency-output > div:nth-of-type(2) {
    display: flex !important;
    align-items: flex-end !important;
    height: 100% !important;
    padding: 16px 0 0 !important;
    margin: 0 !important;
  }

  .home-trade-swap #swap-currency-input [class*='InputPanel'],
  .home-trade-swap #swap-currency-output [class*='InputPanel'] {
    display: none !important;
  }

  .home-trade-swap #swap-currency-input [class*='InputContainer'],
  .home-trade-swap #swap-currency-output [class*='InputContainer'] {
    background: transparent !important;
    border: none !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    padding: 0 !important;
    flex: 1 !important;
    min-width: 0 !important;
  }

  .home-trade-swap [class*='InputPanel'] [class*='InputRow'],
  .home-trade-swap [class*='InputPanel'] > div[style] {
    display: none !important;
  }

  .home-trade-swap [class*='LabelRow'] {
    padding: 0 !important;
    min-height: 0 !important;
    margin-bottom: 4px !important;
  }

  .home-trade-swap [class*='InputContainer'] {
    padding: 0 !important;
    padding-right: 96px !important;
    background: transparent !important;
  }

  .home-trade-swap [class*='CurrencyInputPanel'] label,
  .home-trade-swap [class*='InputPanel'] label,
  .home-trade-swap [class*='LabelRow'] span,
  .home-trade-swap [class*='LabelRow'] div {
    font-size: 11px !important;
    font-weight: 600 !important;
    letter-spacing: 0.08em !important;
    text-transform: uppercase !important;
    color: #8a8a8a !important;
    margin-bottom: 0 !important;
    line-height: 1.2 !important;
  }

  .home-trade-swap .token-amount-input,
  .home-trade-swap [class*='CurrencyInputPanel'] input,
  .home-trade-swap [class*='InputPanel'] input {
    font-size: 32px !important;
    color: ${colors.textPrimary} !important;
    font-weight: 700 !important;
    line-height: 1 !important;
    padding: 0 !important;
    min-height: 36px !important;
    height: 36px !important;
    width: 100% !important;
    max-width: 100% !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    outline: none !important;
    animation: ${swapValueFade} 180ms ease;
  }

  .home-trade-swap [class*='InputPanel'] input,
  .home-trade-swap [class*='CurrencyInputPanel'] [class*='Input'] {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }

  .home-trade-swap .open-currency-select-button,
  .home-trade-swap [class*='CurrencySelect'] button,
  .home-trade-swap [class*='OpenCurrencySelectButton'] {
    position: absolute !important;
    right: 14px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    height: auto !important;
    min-height: 0 !important;
    max-height: none !important;
    min-width: 0 !important;
    border-radius: 0 !important;
    background: transparent !important;
    border: none !important;
    font-size: 13px !important;
    font-weight: 700 !important;
    padding: 0 !important;
    margin: 0 !important;
    color: ${colors.textPrimary} !important;
    box-shadow: none !important;
    gap: 6px !important;
    z-index: 3 !important;
  }

  .home-trade-swap .open-currency-select-button img,
  .home-trade-swap [class*='OpenCurrencySelectButton'] img {
    width: 22px !important;
    height: 22px !important;
  }

  .home-trade-swap .open-currency-select-button svg,
  .home-trade-swap [class*='OpenCurrencySelectButton'] svg {
    width: 14px !important;
    height: 14px !important;
  }

  .home-trade-swap [class*='ArrowWrapper'],
  .home-trade-swap [class*='SwitchButton'] button {
    width: 40px !important;
    height: 40px !important;
    min-width: 40px !important;
    min-height: 40px !important;
    border-radius: 50% !important;
    background: #121212 !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    padding: 0 !important;
    margin: -4px auto !important;
    color: ${colors.textPrimary} !important;
    z-index: 2 !important;
    transition: transform 200ms ease, border-color 150ms ease !important;
  }

  .home-trade-swap [class*='SwitchButton'] button:hover {
    transform: rotate(180deg) !important;
    border-color: rgba(255, 255, 255, 0.14) !important;
  }

  .home-trade-swap [class*='SwitchButton'] button:active {
    animation: ${swapArrowPulse} 200ms ease !important;
  }

  .home-trade-swap [class*='AutoRow'][style*='padding'] {
    padding: 0 !important;
    margin: -4px auto !important;
    min-height: 32px !important;
    max-height: 32px !important;
  }

  .home-trade-swap [class*='Info'],
  .home-trade-swap [class*='SwapUI'] {
    display: none !important;
  }

  .home-trade-swap [class*='ToggleRow'] {
    display: none !important;
  }

  .home-trade-swap [class*='AdvancedDetailsFooter'] {
    max-height: 200px !important;
    opacity: 1 !important;
    padding: 0 !important;
    margin: 8px 0 0 !important;
    width: 100% !important;
    max-width: none !important;
    overflow: visible !important;
  }

  .home-trade-swap [class*='AdvancedDetailsFooter'] > div,
  .home-trade-swap [class*='AdvancedSwapDetails'] {
    padding: 0 !important;
    background: transparent !important;
    border: none !important;
  }

  .home-trade-swap [class*='AdvancedSwapDetails'] [class*='RowBetween'],
  .home-trade-swap [class*='AdvancedSwapDetails'] > div > div {
    display: flex !important;
    align-items: center !important;
    justify-content: space-between !important;
    min-height: 17px !important;
    margin: 0 !important;
    padding: 0 !important;
    font-size: 13px !important;
    line-height: 1.3 !important;
  }

  .home-trade-swap [class*='AdvancedSwapDetails'] [class*='Text'],
  .home-trade-swap [class*='AdvancedSwapDetails'] span {
    font-size: 13px !important;
    color: #8a8a8a !important;
    font-weight: 500 !important;
  }

  .home-trade-swap [class*='AdvancedSwapDetails'] [class*='Text']:last-child,
  .home-trade-swap [class*='AdvancedSwapDetails'] [class*='RowBetween'] > :last-child {
    color: #ffffff !important;
    font-weight: 600 !important;
    animation: ${swapValueFade} 180ms ease;
  }

  .home-trade-swap [class*='PercentInput'],
  .home-trade-swap [class*='CommonBases'],
  .home-trade-swap [class*='Message'] {
    display: none !important;
  }

  .home-trade-swap [class*='Checkbox'],
  .home-trade-swap label:has([class*='Checkbox']) {
    display: none !important;
  }

  .home-trade-swap [class*='Box'][class*='mt'] {
    margin-top: 6px !important;
  }

  .home-trade-swap .pancake-button--primary,
  .home-trade-swap button[id='swap-button'],
  .home-trade-swap [class*='CommitButton'] button,
  .home-trade-swap #swap-page > div:last-child button,
  .home-trade-swap [class*='Box'] button:not([class*='OpenCurrencySelectButton']) {
    height: 48px !important;
    min-height: 48px !important;
    max-height: 48px !important;
    width: 100% !important;
    border-radius: 12px !important;
    background: linear-gradient(180deg, #f4c542 0%, #d4af37 100%) !important;
    color: #000000 !important;
    font-weight: 700 !important;
    font-size: 16px !important;
    border: none !important;
    white-space: nowrap !important;
    margin-top: 10px !important;
    margin-bottom: 0 !important;
    box-shadow: none !important;
    transition: filter 150ms ease, transform 150ms ease !important;
  }

  .home-trade-swap .pancake-button--primary:hover,
  .home-trade-swap button[id='swap-button']:hover,
  .home-trade-swap [class*='CommitButton'] button:hover {
    filter: brightness(1.06) !important;
    transform: translateY(-1px) !important;
    box-shadow: none !important;
  }

  .home-trade-swap .pancake-button--primary:active,
  .home-trade-swap button[id='swap-button']:active,
  .home-trade-swap [class*='CommitButton'] button:active {
    transform: scale(0.99) !important;
  }

  .home-trade-swap.show-execution-fallback [class*='AdvancedDetailsFooter'] {
    display: none !important;
  }

  @media (max-width: 767px) {
    .home-trade-swap #swap-page {
      max-height: none !important;
      overflow: visible !important;
    }

    .home-trade-swap #swap-currency-input,
    .home-trade-swap #swap-currency-output {
      height: 88px !important;
      min-height: 88px !important;
      max-height: 88px !important;
    }

    .home-trade-swap #swap-currency-input [class*='Container'],
    .home-trade-swap #swap-currency-output [class*='Container'] {
      height: 88px !important;
      min-height: 88px !important;
      max-height: 88px !important;
    }

    .home-trade-swap .token-amount-input,
    .home-trade-swap [class*='CurrencyInputPanel'] input,
    .home-trade-swap [class*='InputPanel'] input {
      font-size: 28px !important;
    }

    .home-trade-swap .pancake-button--primary,
    .home-trade-swap button[id='swap-button'],
    .home-trade-swap [class*='CommitButton'] button {
      height: 52px !important;
      min-height: 52px !important;
      max-height: 52px !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .home-trade-swap .pancake-button--primary,
    .home-trade-swap button[id='swap-button'],
    .home-trade-swap [class*='SwitchButton'] button,
    .home-trade-swap .token-amount-input {
      transition: none !important;
      animation: none !important;
    }
  }
`

export default HomeTradeGlobalStyle
