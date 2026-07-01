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
  .home-trade-swap > div:first-child:not(#swap-page):not(.home-trade-swap-slippage-strip):not(.home-trade-swap-execution-summary) {
    display: none !important;
    height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    overflow: hidden !important;
  }

  .home-trade-swap {
    display: flex !important;
    flex-direction: column !important;
    flex: 1 !important;
    min-height: 0 !important;
    overflow: hidden !important;
    justify-content: flex-start !important;
  }

  .home-trade-swap #swap-page {
    padding: 0 !important;
    min-height: 0 !important;
    max-height: none !important;
    height: auto !important;
    width: 100% !important;
    max-width: 100% !important;
    background: transparent !important;
    overflow: hidden !important;
    margin-top: 0 !important;
    display: contents !important;
    box-sizing: border-box !important;
  }

  .home-trade-swap [class*='AutoColumn'] {
    gap: 0 !important;
    flex: 0 0 auto !important;
    min-height: 0 !important;
    order: 1;
    display: flex !important;
    flex-direction: column !important;
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }

  /* Home cockpit: exactly one slippage row — hide uikit SwapUI.Info duplicate */
  .home-swap-cockpit .home-trade-swap #swap-currency-output + div {
    display: none !important;
    height: 0 !important;
    max-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }

  .home-swap-cockpit .home-trade-swap-slippage-strip.slippage-row {
    display: flex !important;
  }

  .home-swap-cockpit .slippage-row:not(.home-trade-swap-slippage-strip) {
    display: none !important;
    height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
  }

  .home-trade-swap.is-disconnected .home-trade-swap-slippage-strip {
    display: flex;
    align-items: center;
    justify-content: space-between;
    order: 2;
    height: 24px;
    max-height: 24px;
    margin-top: 8px;
    margin-bottom: 10px;
    padding: 0;
    flex-shrink: 0;
    font-size: 14px;
    line-height: 20px;
    pointer-events: auto;
    position: static;
  }

  .home-trade-swap.is-disconnected .home-trade-swap-execution-label {
    color: #b3b3b3;
    font-size: 14px;
    font-weight: 700;
    line-height: 20px;
  }

  .home-trade-swap.is-disconnected .home-trade-swap-execution-value.is-slippage {
    color: #f4c542;
    font-size: 14px;
    font-weight: 700;
    line-height: 20px;
  }

  .home-trade-swap-slippage-edit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    margin-left: 8px;
    padding: 0;
    border: none;
    background: transparent;
    color: #f4c542;
    cursor: pointer;
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  .home-trade-swap-slippage-edit svg {
    width: 14px;
    height: 14px;
  }

  /* Kill duplicate slippage from SmartSwapForm footer — single custom row only */
  .home-trade-swap [class*='AdvancedDetailsFooter'],
  .home-trade-swap [class*='AdvancedSwapDetails'] {
    display: none !important;
    height: 0 !important;
    max-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    visibility: hidden !important;
    pointer-events: none !important;
  }

  .home-trade-swap.show-execution-fallback .home-trade-swap-slippage-strip {
    display: none;
  }

  .home-trade-swap.show-execution-fallback .home-trade-swap-execution-summary {
    display: none;
  }

  .home-trade-swap-slippage-label-row {
    display: inline-flex;
    align-items: center;
    gap: 0;
  }

  .home-trade-swap #swap-page > div:last-child,
  .home-trade-swap [class*='Box'][class*='mt'] {
    order: 3;
    margin-top: 8px !important;
    margin-bottom: 0 !important;
    flex-shrink: 0 !important;
    position: relative !important;
    width: 100% !important;
    max-width: 100% !important;
    z-index: 1 !important;
    box-sizing: border-box !important;
  }

  .home-trade-swap [class*='ConnectWallet'],
  .home-trade-swap a[class*='ConnectWallet'],
  .home-trade-swap #swap-page > div:last-child button {
    position: relative !important;
    top: auto !important;
    left: auto !important;
    transform: none !important;
  }
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

  .home-trade-swap-execution-row {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    min-height: 10px;
    height: 10px;
    font-size: 10px;
    line-height: 10px;
  }

  .home-trade-swap-execution-label,
  .home-trade-swap-execution-row span:first-child {
    color: #8a8a8a;
    font-weight: 500;
    white-space: nowrap;
  }

  .home-trade-swap-execution-value,
  .home-trade-swap-execution-row span:last-child {
    color: #ffffff;
    font-weight: 600;
    text-align: right;
    white-space: nowrap;
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .home-trade-swap-execution-value.is-slippage {
    color: #f4c542;
  }

  .home-trade-swap.is-disconnected [class*='ConnectWallet'],
  .home-trade-swap.is-disconnected a[class*='ConnectWallet'],
  .home-trade-swap.is-disconnected button[class*='pancake-button']:only-child {
    height: 44px !important;
    min-height: 44px !important;
    max-height: 44px !important;
    width: 100% !important;
    border-radius: 12px !important;
    margin-top: 8px !important;
    margin-bottom: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    background: linear-gradient(180deg, #f4c542 0%, #d4af37 100%) !important;
    color: #050505 !important;
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
    gap: 10px !important;
    flex: 0 0 auto !important;
    min-height: 0 !important;
  }

  .home-trade-swap #swap-page > div:first-of-type {
    flex: 0 0 auto !important;
  }

  .home-trade-swap #swap-page > div:last-child {
    flex: 0 0 auto !important;
    margin-top: 0 !important;
  }

  .home-trade-swap #swap-currency-input,
  .home-trade-swap #swap-currency-output {
    position: relative !important;
    display: block !important;
    visibility: visible !important;
    background: #171717 !important;
    border: 1px solid rgba(255, 255, 255, 0.05) !important;
    border-radius: 14px !important;
    padding: 0 !important;
    height: 72px !important;
    min-height: 72px !important;
    max-height: 72px !important;
    overflow: hidden !important;
    margin-top: 10px !important;
    box-sizing: border-box !important;
    box-shadow: none !important;
  }

  .home-trade-swap #swap-currency-input {
    margin-top: 10px !important;
  }

  .home-trade-swap #swap-currency-input::before,
  .home-trade-swap #swap-currency-output::before {
    content: '';
    position: absolute;
    top: 12px;
    left: 14px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #a8a8a8;
    line-height: 11px;
    z-index: 4;
    pointer-events: none;
  }

  .home-trade-swap #swap-currency-input::before {
    content: 'FROM';
  }

  .home-trade-swap #swap-currency-output::before {
    content: 'TO';
  }

  .home-trade-swap #swap-currency-input > div:first-of-type,
  .home-trade-swap #swap-currency-output > div:first-of-type {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 0 !important;
    height: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    overflow: hidden !important;
    opacity: 0 !important;
    pointer-events: none !important;
    z-index: -1 !important;
  }

  .home-trade-swap #swap-currency-input > div:nth-of-type(2),
  .home-trade-swap #swap-currency-output > div:nth-of-type(2) {
    position: absolute !important;
    inset: 0 !important;
    display: block !important;
    padding: 0 !important;
    margin: 0 !important;
    height: 100% !important;
    pointer-events: none !important;
  }

  .home-trade-swap #swap-currency-input > div:nth-of-type(2) *,
  .home-trade-swap #swap-currency-output > div:nth-of-type(2) * {
    pointer-events: auto;
  }

  .home-trade-swap #swap-currency-input > div:nth-of-type(3),
  .home-trade-swap #swap-currency-output > div:nth-of-type(3) {
    display: none !important;
  }

  .home-trade-swap #swap-currency-input [class*='InputContainer'] > div,
  .home-trade-swap #swap-currency-output [class*='InputContainer'] > div {
    height: 32px !important;
    min-height: 32px !important;
    max-height: 32px !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .home-trade-swap #swap-currency-input [class*='InputContainer'],
  .home-trade-swap #swap-currency-output [class*='InputContainer'] {
    background: transparent !important;
    border: none !important;
    height: 32px !important;
    min-height: 32px !important;
    max-height: 32px !important;
    padding: 0 !important;
    flex: 0 0 auto !important;
    min-width: 0 !important;
    width: 100% !important;
  }

  .home-trade-swap [class*='InputPanel'] [class*='InputRow'],
  .home-trade-swap [class*='InputPanel'] > div[style] {
    display: none !important;
  }

  .home-trade-swap [class*='InputContainer'] {
    position: static !important;
    left: auto !important;
    bottom: auto !important;
    right: auto !important;
    padding: 0 !important;
    background: transparent !important;
  }

  .home-trade-swap [class*='InputContainer'] [class*='LabelRow'] {
    padding: 0 !important;
    margin: 0 !important;
  }

  .home-trade-swap [class*='CurrencyInputPanel'] label,
  .home-trade-swap [class*='InputPanel'] label {
    display: none !important;
  }

  .home-trade-swap .token-amount-input,
  .home-trade-swap [class*='CurrencyInputPanel'] input,
  .home-trade-swap [class*='InputPanel'] input {
    position: absolute !important;
    left: 14px !important;
    bottom: 12px !important;
    right: 112px !important;
    width: auto !important;
    font-size: 30px !important;
    color: ${colors.textPrimary} !important;
    font-weight: 700 !important;
    line-height: 30px !important;
    padding: 0 !important;
    min-height: 30px !important;
    height: 30px !important;
    max-width: none !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    outline: none !important;
    text-transform: none !important;
    letter-spacing: normal !important;
    opacity: 0.82 !important;
    animation: ${swapValueFade} 180ms ease;
    z-index: 2 !important;
  }

  @media (min-width: 768px) {
    [data-swap-size='home'] > div:first-child {
      padding-top: 12px !important;
      max-height: 58px !important;
      overflow: hidden !important;
      flex-shrink: 0 !important;
    }

    [data-swap-size='home'] h1 {
      font-size: 24px !important;
      line-height: 28px !important;
      margin: 0 0 2px !important;
    }

    [data-swap-size='home'] p {
      font-size: 11px !important;
      line-height: 14px !important;
      margin: 2px 0 0 !important;
    }

    [data-swap-size='home'] > div:nth-child(2) {
      margin-top: 6px !important;
    }

    .home-trade-swap [class*='AutoColumn'] {
      gap: 0 !important;
    }

    .home-trade-swap #swap-currency-input,
    .home-trade-swap #swap-currency-output {
      height: 64px !important;
      min-height: 64px !important;
      max-height: 64px !important;
      padding: 0 !important;
      margin-top: 0 !important;
    }

    .home-trade-swap #swap-currency-input {
      margin-top: 0 !important;
    }

    .home-trade-swap #swap-currency-output {
      margin-top: 0 !important;
    }

    .home-trade-swap #swap-currency-input::before,
    .home-trade-swap #swap-currency-output::before {
      top: 12px;
      font-size: 10px;
      line-height: 10px;
    }

    .home-trade-swap #swap-currency-input [class*='InputContainer'] > div,
    .home-trade-swap #swap-currency-output [class*='InputContainer'] > div {
      height: 28px !important;
      min-height: 28px !important;
      max-height: 28px !important;
    }

    .home-trade-swap #swap-currency-input [class*='InputContainer'],
    .home-trade-swap #swap-currency-output [class*='InputContainer'] {
      height: 28px !important;
      min-height: 28px !important;
      max-height: 28px !important;
    }

    .home-trade-swap .token-amount-input,
    .home-trade-swap [class*='CurrencyInputPanel'] input,
    .home-trade-swap [class*='InputPanel'] input {
      font-size: 28px !important;
      line-height: 28px !important;
      bottom: 10px !important;
      height: 28px !important;
      min-height: 28px !important;
    }

    .home-trade-swap .open-currency-select-button,
    .home-trade-swap [class*='CurrencySelect'] button,
    .home-trade-swap [class*='OpenCurrencySelectButton'] {
      height: 36px !important;
      min-height: 36px !important;
      max-height: 36px !important;
    }

    .home-trade-swap [class*='ArrowWrapper'],
    .home-trade-swap [class*='SwitchButton'] button {
      width: 28px !important;
      height: 28px !important;
      min-width: 28px !important;
      min-height: 28px !important;
      margin: 0 auto !important;
    }

    .home-trade-swap [class*='AutoRow'][style*='padding'] {
      min-height: 28px !important;
      max-height: 28px !important;
      height: 28px !important;
      margin: 0 auto !important;
      padding: 0 !important;
    }

    .home-trade-swap.is-disconnected .home-trade-swap-slippage-strip {
      margin-top: 8px !important;
      margin-bottom: 4px !important;
    }

    .home-trade-swap #swap-page > div:last-child,
    .home-trade-swap [class*='Box'][class*='mt'] {
      height: 44px !important;
      min-height: 44px !important;
      max-height: 44px !important;
      margin-top: 8px !important;
      margin-bottom: 0 !important;
      padding: 0 !important;
    }

    .home-trade-swap [class*='AdvancedSwapDetails'] [class*='RowBetween'],
    .home-trade-swap [class*='AdvancedSwapDetails'] > div > div {
      min-height: 10px !important;
      height: 10px !important;
      font-size: 10px !important;
      line-height: 10px !important;
    }

    .home-trade-swap .pancake-button--primary,
    .home-trade-swap button[id='swap-button'],
    .home-trade-swap [class*='CommitButton'] button,
    .home-trade-swap #swap-page > div:last-child button,
    .home-trade-swap [class*='Box'] button:not([class*='OpenCurrencySelectButton']) {
      height: 44px !important;
      min-height: 44px !important;
      max-height: 44px !important;
      margin-top: 8px !important;
      margin-bottom: 0 !important;
      flex-shrink: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 100% !important;
    }

    .home-trade-swap.is-disconnected [class*='ConnectWallet'],
    .home-trade-swap.is-disconnected a[class*='ConnectWallet'],
    .home-trade-swap.is-disconnected button[class*='pancake-button']:only-child {
      height: 44px !important;
      min-height: 44px !important;
      max-height: 44px !important;
      flex-shrink: 0 !important;
    }
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
    right: 12px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    height: 38px !important;
    min-height: 38px !important;
    max-height: 38px !important;
    min-width: 104px !important;
    border-radius: 10px !important;
    background: rgba(0, 0, 0, 0.18) !important;
    border: 1px solid rgba(255, 255, 255, 0.06) !important;
    font-size: 15px !important;
    font-weight: 700 !important;
    padding: 0 10px !important;
    margin: 0 !important;
    color: ${colors.textPrimary} !important;
    box-shadow: none !important;
    gap: 8px !important;
    z-index: 3 !important;
    display: inline-flex !important;
    align-items: center !important;
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
    margin: 6px auto !important;
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
    margin: 0 auto !important;
    min-height: 30px !important;
    max-height: 30px !important;
  }

  .home-trade-swap [class*='Info'],
  .home-trade-swap [class*='SwapUI'] {
    display: none !important;
  }

  .home-trade-swap [class*='ToggleRow'] {
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

  .home-trade-swap .pancake-button--primary,
  .home-trade-swap button[id='swap-button'],
  .home-trade-swap [class*='CommitButton'] button,
  .home-trade-swap #swap-page > div:last-child button,
  .home-trade-swap [class*='Box'] button:not([class*='OpenCurrencySelectButton']) {
    height: 44px !important;
    min-height: 44px !important;
    max-height: 44px !important;
    width: 100% !important;
    border-radius: 12px !important;
    background: linear-gradient(180deg, #f4c542 0%, #d4af37 100%) !important;
    color: #050505 !important;
    font-weight: 700 !important;
    font-size: 16px !important;
    border: none !important;
    white-space: nowrap !important;
    margin-top: 8px !important;
    margin-bottom: 0 !important;
    box-shadow: none !important;
    flex-shrink: 0 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
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

  @media (max-width: 767px) {
    .home-trade-swap #swap-page {
      max-height: none !important;
      overflow: visible !important;
    }

    .home-trade-swap #swap-currency-input,
    .home-trade-swap #swap-currency-output {
      height: 72px !important;
      min-height: 72px !important;
      max-height: 72px !important;
    }

    .home-trade-swap .token-amount-input,
    .home-trade-swap [class*='CurrencyInputPanel'] input,
    .home-trade-swap [class*='InputPanel'] input {
      font-size: 28px !important;
    }

    .home-trade-swap .pancake-button--primary,
    .home-trade-swap button[id='swap-button'],
    .home-trade-swap [class*='CommitButton'] button {
      height: 48px !important;
      min-height: 48px !important;
      max-height: 48px !important;
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
