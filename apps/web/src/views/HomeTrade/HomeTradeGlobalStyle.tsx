import { createGlobalStyle } from 'styled-components'
import { ht } from './homeTradeTokens'

const HomeTradeGlobalStyle = createGlobalStyle`
  .home-trade-swap [class*='HeaderWrapper'] {
    display: none !important;
  }

  .home-trade-swap #swap-page {
    padding: 0 !important;
    min-height: auto !important;
    background: transparent !important;
  }

  .home-trade-swap [class*='Container'] {
    background: #151515 !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    border-radius: 10px !important;
  }

  .home-trade-swap .pancake-button--primary,
  .home-trade-swap button[id='swap-button'],
  .home-trade-swap [class*='CommitButton'] {
    height: 44px !important;
    border-radius: 8px !important;
    background: linear-gradient(180deg, ${ht.goldBright} 0%, ${ht.gold} 100%) !important;
    color: #000000 !important;
    font-weight: 700 !important;
    font-size: 15px !important;
    border: none !important;
  }

  .home-trade-swap [class*='ToggleRow'],
  .home-trade-swap button[type='button'] {
    font-family: ${ht.fontBody} !important;
  }

  @media (max-width: 767px) {
    .home-trade-swap .pancake-button--primary,
    .home-trade-swap button[id='swap-button'] {
      height: 48px !important;
      border-radius: 10px !important;
    }
  }
`

export default HomeTradeGlobalStyle
