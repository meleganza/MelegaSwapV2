import { createGlobalStyle } from 'styled-components'
import { colors } from 'design-system/melega/tokens'

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

  .home-trade-swap [class*='CurrencyInputHeader'] button:not([class*='OpenCurrencySelectButton']),
  .home-trade-swap #open-settings-dialog-button-SWAP_LIQUIDITY,
  .home-trade-swap [class*='RefreshIcon'],
  .home-trade-swap button[aria-label*='Refresh'] {
    display: none !important;
  }

  .home-trade-swap [class*='AutoColumn'] {
    gap: 0 !important;
  }

  .home-trade-swap #swap-currency-input,
  .home-trade-swap #swap-currency-output {
    height: 74px !important;
    min-height: 74px !important;
    max-height: 74px !important;
    overflow: hidden !important;
    margin-top: 12px !important;
  }

  .home-trade-swap #swap-currency-input:first-of-type {
    margin-top: 0 !important;
  }

  .home-trade-swap #swap-currency-input [class*='Container'],
  .home-trade-swap #swap-currency-output [class*='Container'] {
    background: rgba(255, 255, 255, 0.045) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 14px !important;
    height: 74px !important;
    min-height: 74px !important;
    max-height: 74px !important;
    padding: 0 !important;
    overflow: hidden !important;
    box-shadow: none !important;
  }

  .home-trade-swap [class*='InputPanel'] > div:first-child {
    display: none !important;
  }

  .home-trade-swap [class*='InputPanel'] [class*='InputRow'],
  .home-trade-swap [class*='InputPanel'] > div[style] {
    display: none !important;
  }

  .home-trade-swap [class*='LabelRow'] {
    padding: 11px 14px 0 !important;
    min-height: 0 !important;
  }

  .home-trade-swap [class*='InputContainer'] {
    padding: 0 14px 11px !important;
    background: transparent !important;
  }

  .home-trade-swap [class*='CurrencyInputPanel'] label,
  .home-trade-swap [class*='InputPanel'] label,
  .home-trade-swap [class*='LabelRow'] + * {
    font-size: 12px !important;
    color: ${colors.textSecondary} !important;
    margin-bottom: 6px !important;
  }

  .home-trade-swap .token-amount-input,
  .home-trade-swap [class*='CurrencyInputPanel'] input,
  .home-trade-swap [class*='InputPanel'] input {
    font-size: 26px !important;
    color: ${colors.textPrimary} !important;
    font-weight: 500 !important;
    line-height: 1 !important;
    padding: 0 !important;
    min-height: 32px !important;
    height: 32px !important;
    width: 220px !important;
    max-width: 100% !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    outline: none !important;
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
    height: 34px !important;
    min-height: 34px !important;
    max-height: 34px !important;
    min-width: 104px !important;
    border-radius: 999px !important;
    background: rgba(0, 0, 0, 0.18) !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    font-size: 15px !important;
    font-weight: 800 !important;
    padding: 0 10px !important;
    margin: 0 10px 10px !important;
    color: ${colors.textPrimary} !important;
    box-shadow: none !important;
  }

  .home-trade-swap [class*='ArrowWrapper'],
  .home-trade-swap [class*='SwitchButton'] button {
    width: 34px !important;
    height: 34px !important;
    min-width: 34px !important;
    min-height: 34px !important;
    border-radius: 50% !important;
    background: ${colors.background} !important;
    border: 1px solid rgba(212, 175, 55, 0.35) !important;
    padding: 0 !important;
    margin: -6px auto !important;
    color: ${colors.gold} !important;
    z-index: 2 !important;
    transition: transform 250ms ease-out !important;
  }

  .home-trade-swap [class*='SwitchButton'] button:active {
    transform: rotate(180deg) !important;
  }

  .home-trade-swap [class*='AutoRow'][style*='padding'] {
    padding: 0 !important;
    margin: 0 !important;
    min-height: 34px !important;
    max-height: 34px !important;
  }

  .home-trade-swap [class*='Info'],
  .home-trade-swap [class*='SwapUI'] {
    display: flex !important;
    flex-direction: column !important;
    gap: 0 !important;
    margin-top: 8px !important;
    font-size: 12px !important;
    color: ${colors.textSecondary} !important;
    min-height: 24px !important;
    max-height: none !important;
    overflow: visible !important;
  }

  .home-trade-swap [class*='Details'] {
    display: block !important;
    height: auto !important;
    min-height: 22px !important;
    font-size: 12px !important;
    color: ${colors.textSecondary} !important;
    text-align: center !important;
    margin-top: 6px !important;
    overflow: visible !important;
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
    margin-top: 8px !important;
  }

  .home-trade-swap .pancake-button--primary,
  .home-trade-swap button[id='swap-button'],
  .home-trade-swap [class*='CommitButton'] button,
  .home-trade-swap #swap-page > div:last-child button,
  .home-trade-swap [class*='Box'] button:not([class*='OpenCurrencySelectButton']) {
    height: 46px !important;
    min-height: 46px !important;
    max-height: 46px !important;
    width: 100% !important;
    border-radius: 12px !important;
    background: linear-gradient(180deg, ${colors.goldHover} 0%, ${colors.gold} 100%) !important;
    color: #000000 !important;
    font-weight: 800 !important;
    font-size: 15px !important;
    border: none !important;
    white-space: nowrap !important;
    margin-top: 8px !important;
    transition: filter 150ms ease, transform 150ms ease, box-shadow 150ms ease !important;
  }

  .home-trade-swap .pancake-button--primary:hover,
  .home-trade-swap button[id='swap-button']:hover,
  .home-trade-swap [class*='CommitButton'] button:hover {
    filter: brightness(1.08) !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 0 18px rgba(212, 175, 55, 0.22) !important;
  }

  .home-trade-swap .pancake-button--primary:active,
  .home-trade-swap button[id='swap-button']:active,
  .home-trade-swap [class*='CommitButton'] button:active {
    transform: scale(0.98) !important;
  }

  @media (max-width: 767px) {
    .home-trade-swap #swap-page {
      max-height: none !important;
      overflow: visible !important;
    }

    .home-trade-swap #swap-currency-input,
    .home-trade-swap #swap-currency-output {
      height: 104px !important;
      min-height: 104px !important;
      max-height: 104px !important;
    }

    .home-trade-swap #swap-currency-input [class*='Container'],
    .home-trade-swap #swap-currency-output [class*='Container'] {
      height: 104px !important;
      min-height: 104px !important;
      max-height: 104px !important;
      border-radius: 16px !important;
    }

    .home-trade-swap .token-amount-input,
    .home-trade-swap [class*='CurrencyInputPanel'] input,
    .home-trade-swap [class*='InputPanel'] input {
      font-size: 30px !important;
    }

    .home-trade-swap .pancake-button--primary,
    .home-trade-swap button[id='swap-button'],
    .home-trade-swap [class*='CommitButton'] button {
      height: 52px !important;
      min-height: 52px !important;
      max-height: 52px !important;
      border-radius: 14px !important;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .home-trade-swap .pancake-button--primary,
    .home-trade-swap button[id='swap-button'],
    .home-trade-swap [class*='SwitchButton'] button {
      transition: none !important;
    }
  }
`

export default HomeTradeGlobalStyle
