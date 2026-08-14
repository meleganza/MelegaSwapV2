import { createGlobalStyle } from 'styled-components'
import { PancakeTheme } from '@pancakeswap/uikit'
import { melegaOperational as tokens } from 'ui/tokens'

declare module 'styled-components' {
  /* eslint-disable @typescript-eslint/no-empty-interface */
  export interface DefaultTheme extends PancakeTheme {}
}

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Inter';
    src: url('/fonts/inter/inter-v12-latin-regular.woff2') format('woff2');
    font-style: normal;
    font-weight: 400;
    font-display: swap;
  }

  @font-face {
    font-family: 'Inter';
    src: url('/fonts/inter/inter-v12-latin-500.woff2') format('woff2');
    font-style: normal;
    font-weight: 500;
    font-display: swap;
  }

  @font-face {
    font-family: 'Melega Relative';
    src: url('/fonts/relative/relative-book-pro.woff2') format('woff2');
    font-style: normal;
    font-weight: 400;
    font-display: swap;
  }

  :root {
    color-scheme: dark;
    background: ${tokens.bg};
    font-synthesis: weight;
    text-rendering: optimizeLegibility;
  }

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
    letter-spacing: -0.025em;
    text-wrap: balance;
  }

  body {
    background:
      radial-gradient(circle at 74% -10%, rgba(244, 196, 48, 0.055), transparent 34rem),
      radial-gradient(circle at -12% 28%, rgba(116, 97, 255, 0.035), transparent 28rem),
      ${tokens.bg} !important;
    color: ${tokens.text};
    margin: 0;
    min-height: 100vh;
    line-height: 1.5;
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

  button,
  input,
  select,
  textarea {
    font: inherit;
  }

  button,
  a,
  [role='button'] {
    -webkit-tap-highlight-color: transparent;
  }

  :where(button, a, input, select, textarea, [role='button']):focus-visible {
    outline: 2px solid ${tokens.gold};
    outline-offset: 3px;
  }

  :where([data-melega-numeric], [data-amount], [data-price], [data-balance]) {
    font-variant-numeric: tabular-nums slashed-zero;
    letter-spacing: -0.015em;
  }

  ::selection {
    color: ${tokens.bg};
    background: ${tokens.gold};
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
