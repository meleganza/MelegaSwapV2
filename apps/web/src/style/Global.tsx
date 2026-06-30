import { createGlobalStyle } from 'styled-components'
import { PancakeTheme } from '@pancakeswap/uikit'
import { melegaOperational as tokens } from 'ui/tokens'

declare module 'styled-components' {
  /* eslint-disable @typescript-eslint/no-empty-interface */
  export interface DefaultTheme extends PancakeTheme {}
}

const GlobalStyle = createGlobalStyle`
  * {
    font-family: ${tokens.fontBody};
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${tokens.fontDisplay};
  }

  body {
    background-color: ${tokens.bg} !important;
    color: ${tokens.text};

    img {
      height: auto;
      max-width: 100%;
    }
  }

  /* Melega Economic OS — neutralize Pancake-era accent colors */
  a {
    transition: color ${tokens.transition};
  }
`

export default GlobalStyle
