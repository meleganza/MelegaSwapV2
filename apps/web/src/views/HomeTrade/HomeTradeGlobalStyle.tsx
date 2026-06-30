import { createGlobalStyle } from 'styled-components'
import { ht } from './homeTradeTokens'

const HomeTradeGlobalStyle = createGlobalStyle`
  .home-trade-swap [class*='HeaderWrapper'] {
    display: none !important;
    height: 0 !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    overflow: hidden !important;
  }

  .home-trade-swap #swap-page {
    padding: 0 !important;
    min-height: auto !important;
    background: transparent !important;
    overflow: visible !important;
  }

  .home-trade-swap [class*='AutoColumn'] {
    gap: 8px !important;
  }

  .home-trade-swap [class*='InputPanel'] [class*='Container'],
  .home-trade-swap [class*='CurrencyInputPanel'] > div:first-child,
  .home-trade-swap [class*='CurrencyInputPanel'] [class*='InputRow'] {
    background: ${ht.surface3} !important;
    border: 1px solid ${ht.borderSoft} !important;
    border-radius: 12px !important;
    min-height: 90px !important;
    padding: 14px !important;
    box-sizing: border-box !important;
  }

  .home-trade-swap [class*='CurrencyInputPanel'] label,
  .home-trade-swap [class*='InputPanel'] label {
    font-size: 13px !important;
    color: #bdbdbd !important;
    font-weight: 500 !important;
  }

  .home-trade-swap [class*='CurrencyInputPanel'] input,
  .home-trade-swap [class*='InputPanel'] input {
    font-size: 28px !important;
    color: ${ht.white} !important;
    font-weight: 600 !important;
  }

  .home-trade-swap [class*='CurrencySelect'] button,
  .home-trade-swap [class*='OpenCurrencySelectButton'] {
    height: 42px !important;
    border-radius: 10px !important;
    background: ${ht.surface2} !important;
    border: 1px solid ${ht.borderSoft} !important;
  }

  .home-trade-swap [class*='ArrowWrapper'],
  .home-trade-swap [class*='SwitchButton'] button,
  .home-trade-swap button[class*='Switch'] {
    width: 38px !important;
    height: 38px !important;
    min-width: 38px !important;
    min-height: 38px !important;
    border-radius: 50% !important;
    background: ${ht.surface2} !important;
    border: 1px solid ${ht.borderSoft} !important;
    padding: 0 !important;
  }

  .home-trade-swap [class*='AutoRow'][style*='padding'] {
    padding: 0 !important;
    margin: -4px 0 !important;
  }

  .home-trade-swap [class*='Info'] {
    min-height: 28px !important;
    padding: 4px 0 !important;
    background: transparent !important;
    border: none !important;
  }

  .home-trade-swap [class*='Details'] summary,
  .home-trade-swap [class*='Details'] button {
    font-size: 13px !important;
    color: ${ht.textMuted} !important;
  }

  .home-trade-swap .pancake-button--primary,
  .home-trade-swap button[id='swap-button'],
  .home-trade-swap [class*='CommitButton'] button {
    height: 46px !important;
    width: 100% !important;
    border-radius: 10px !important;
    background: linear-gradient(180deg, ${ht.goldBright} 0%, ${ht.gold} 100%) !important;
    color: #000000 !important;
    font-weight: 700 !important;
    font-size: 15px !important;
    border: none !important;
    white-space: nowrap !important;
  }

  .home-trade-swap [class*='PercentInput'] {
    display: none !important;
  }

  @media (max-width: 1023px) {
    .home-trade-swap [class*='InputPanel'] [class*='Container'],
    .home-trade-swap [class*='CurrencyInputPanel'] > div:first-child {
      min-height: 96px !important;
    }

    .home-trade-swap .pancake-button--primary,
    .home-trade-swap button[id='swap-button'],
    .home-trade-swap [class*='CommitButton'] button {
      height: 48px !important;
    }
  }
`

export default HomeTradeGlobalStyle
