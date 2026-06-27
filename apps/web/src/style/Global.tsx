import { createGlobalStyle } from 'styled-components'
import { PancakeTheme } from '@pancakeswap/uikit'

declare module 'styled-components' {
  /* eslint-disable @typescript-eslint/no-empty-interface */
  export interface DefaultTheme extends PancakeTheme {}
}

const GlobalStyle = createGlobalStyle`
  * {
    font-family: 'Kanit', sans-serif;
  }
  body {
    background-color: #0a0a0f;

    img {
      height: auto;
      max-width: 100%;
    }
  }

  button,
  a[role="button"],
  [data-testid="wallet-connect-button"] {
    min-height: 44px;
  }
`

export default GlobalStyle
