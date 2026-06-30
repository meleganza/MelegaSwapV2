import { createGlobalStyle } from 'styled-components'
import { PancakeTheme } from '@pancakeswap/uikit'
import { melegaOperational as tokens } from 'ui/tokens'

declare module 'styled-components' {
  /* eslint-disable @typescript-eslint/no-empty-interface */
  export interface DefaultTheme extends PancakeTheme {}
}

const GlobalStyle = createGlobalStyle`
  *,
  *::before,
  *::after {
    font-family: ${tokens.fontBody};
    box-sizing: border-box;
  }

  h1, h2, h3, h4, h5, h6,
  [data-melega-display='true'] {
    font-family: ${tokens.fontDisplay};
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  body {
    background-color: ${tokens.bg} !important;
    color: ${tokens.text};
    margin: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    img {
      height: auto;
      max-width: 100%;
    }
  }

  a {
    transition: color ${tokens.transition};
  }

  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`

export default GlobalStyle
