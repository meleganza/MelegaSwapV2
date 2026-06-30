import { createGlobalStyle } from 'styled-components'
import { ht } from './homeTradeTokens'

const HomeTradeGlobalStyle = createGlobalStyle`
  .home-trade-swap [class*='HeaderWrapper'] {
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
    max-height: 268px !important;
    background: transparent !important;
    overflow: hidden !important;
  }

  .home-trade-swap [class*='AutoColumn'] {
    gap: 2px !important;
  }

  .home-trade-swap #swap-currency-input,
  .home-trade-swap #swap-currency-output {
    height: 76px !important;
    min-height: 76px !important;
    max-height: 76px !important;
    overflow: hidden !important;
  }

  .home-trade-swap #swap-currency-input [class*='Container'],
  .home-trade-swap #swap-currency-output [class*='Container'] {
    background: ${ht.surface3} !important;
    border: 1px solid ${ht.borderSoft} !important;
    border-radius: 10px !important;
    height: 76px !important;
    min-height: 76px !important;
    max-height: 76px !important;
    padding: 0 !important;
    overflow: hidden !important;
  }

  .home-trade-swap [class*='InputPanel'] > div:first-child {
    display: none !important;
  }

  .home-trade-swap [class*='InputPanel'] [class*='InputRow'],
  .home-trade-swap [class*='InputPanel'] > div[style] {
    display: none !important;
  }

  .home-trade-swap [class*='LabelRow'] {
    padding: 8px 12px 0 !important;
    min-height: 0 !important;
  }

  .home-trade-swap [class*='InputContainer'] {
    padding-bottom: 0 !important;
  }

  .home-trade-swap [class*='CurrencyInputPanel'] label,
  .home-trade-swap [class*='InputPanel'] label,
  .home-trade-swap [class*='LabelRow'] + * {
    font-size: 12px !important;
  }

  .home-trade-swap .token-amount-input,
  .home-trade-swap [class*='CurrencyInputPanel'] input,
  .home-trade-swap [class*='InputPanel'] input {
    font-size: 20px !important;
    color: ${ht.white} !important;
    font-weight: 600 !important;
    line-height: 1.1 !important;
    padding: 0 !important;
    min-height: 24px !important;
    height: 24px !important;
  }

  .home-trade-swap .open-currency-select-button,
  .home-trade-swap [class*='CurrencySelect'] button,
  .home-trade-swap [class*='OpenCurrencySelectButton'] {
    height: 38px !important;
    min-height: 38px !important;
    max-height: 38px !important;
    border-radius: 8px !important;
    background: ${ht.surface2} !important;
    border: 1px solid ${ht.borderSoft} !important;
    font-size: 13px !important;
    padding: 0 8px !important;
    margin: 4px 8px 6px !important;
  }

  .home-trade-swap [class*='ArrowWrapper'],
  .home-trade-swap [class*='SwitchButton'] button {
    width: 30px !important;
    height: 30px !important;
    min-width: 30px !important;
    min-height: 30px !important;
    border-radius: 50% !important;
    background: ${ht.surface2} !important;
    border: 1px solid ${ht.borderSoft} !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  .home-trade-swap [class*='AutoRow'][style*='padding'] {
    padding: 0 !important;
    margin: 0 !important;
    min-height: 30px !important;
    max-height: 30px !important;
  }

  .home-trade-swap [class*='Info'],
  .home-trade-swap [class*='SwapUI'] {
    display: none !important;
  }

  .home-trade-swap [class*='Details'] {
    display: none !important;
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
    margin-top: 2px !important;
  }

  .home-trade-swap .pancake-button--primary,
  .home-trade-swap button[id='swap-button'],
  .home-trade-swap [class*='CommitButton'] button,
  .home-trade-swap [class*='Box'] button {
    height: 44px !important;
    min-height: 44px !important;
    max-height: 44px !important;
    width: 100% !important;
    border-radius: 10px !important;
    background: linear-gradient(180deg, ${ht.goldBright} 0%, ${ht.gold} 100%) !important;
    color: #000000 !important;
    font-weight: 700 !important;
    font-size: 14px !important;
    border: none !important;
    white-space: nowrap !important;
    transition: filter 150ms ease, transform 100ms ease, box-shadow 150ms ease !important;
  }

  .home-trade-swap .pancake-button--primary:hover,
  .home-trade-swap button[id='swap-button']:hover,
  .home-trade-swap [class*='CommitButton'] button:hover,
  .home-trade-swap [class*='Box'] button:hover {
    filter: brightness(1.06) !important;
    box-shadow: 0 0 18px rgba(212, 175, 55, 0.22) !important;
  }

  .home-trade-swap .pancake-button--primary:active,
  .home-trade-swap button[id='swap-button']:active,
  .home-trade-swap [class*='CommitButton'] button:active,
  .home-trade-swap [class*='Box'] button:active {
    transform: scale(0.985) !important;
  }

  @media (max-width: 1023px) {
    .home-trade-swap #swap-page {
      max-height: none !important;
      overflow: visible !important;
    }

    .home-trade-swap #swap-currency-input,
    .home-trade-swap #swap-currency-output {
      height: 80px !important;
      min-height: 80px !important;
      max-height: 80px !important;
    }
  }
`

export default HomeTradeGlobalStyle
