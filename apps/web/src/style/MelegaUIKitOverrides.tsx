import { createGlobalStyle } from 'styled-components'
import { melegaOperational as tokens } from 'ui/tokens'

/** UIKit shell overrides — visual only, no routing or logic changes. */
const MelegaUIKitOverrides = createGlobalStyle`
  nav a,
  nav button {
    font-family: ${tokens.fontBody} !important;
  }

  [data-theme='dark'] {
    --colors-background: ${tokens.bg};
    --colors-backgroundAlt: ${tokens.surface};
    --colors-backgroundAlt2: ${tokens.surfaceSecondary};
    --colors-cardBorder: ${tokens.border};
    --colors-primary: ${tokens.gold};
    --colors-primaryBright: ${tokens.goldHighlight};
    --colors-secondary: ${tokens.textSecondary};
    --colors-text: ${tokens.text};
    --colors-textSubtle: ${tokens.textSecondary};
  }
`

export default MelegaUIKitOverrides
