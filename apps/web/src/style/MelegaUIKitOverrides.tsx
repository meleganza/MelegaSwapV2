import { createGlobalStyle } from 'styled-components'
import { melegaOperational as tokens } from 'ui/tokens'

/** Global UIKit presentation overrides — Epic A foundation layer. */
const MelegaUIKitOverrides = createGlobalStyle`
  :root,
  [data-theme='dark'],
  [data-theme='light'] {
    --colors-background: ${tokens.bg};
    --colors-backgroundAlt: ${tokens.surface};
    --colors-backgroundAlt2: ${tokens.surfaceSecondary};
    --colors-primary: ${tokens.gold};
    --colors-primaryBright: ${tokens.goldHighlight};
    --colors-secondary: ${tokens.textSecondary};
    --colors-tertiary: ${tokens.surfaceSecondary};
    --colors-text: ${tokens.text};
    --colors-textSubtle: ${tokens.textSecondary};
    --colors-failure: #ef4444;
    --colors-success: ${tokens.success};
    --colors-cardBorder: ${tokens.border};
    --colors-input: ${tokens.surfaceSecondary};
    --colors-inputSecondary: ${tokens.surface};
    --colors-dropdown: ${tokens.surface};
    --colors-dropdownDeep: ${tokens.bg};
    --colors-modal: ${tokens.surface};
    --colors-modalBackground: rgba(0, 0, 0, 0.78);
    --colors-gradientBubblegum: ${tokens.surfaceSecondary};
    --colors-gradientCardHeader: ${tokens.surfaceSecondary};
    --colors-gradientBlue: ${tokens.surfaceSecondary};
    --colors-gradientViolet: ${tokens.surfaceSecondary};
    --colors-gradientVioletAlt: ${tokens.surfaceSecondary};
    --colors-gradientBold: linear-gradient(135deg, ${tokens.gold} 0%, ${tokens.goldHighlight} 100%);
    --colors-gradientGold: linear-gradient(135deg, ${tokens.gold} 0%, ${tokens.goldHighlight} 100%);
    --colors-gradientBakcground: ${tokens.bg};
    --colors-bg: ${tokens.gold};
  }

  html {
    background: ${tokens.bg};
    color-scheme: dark;
  }

  body {
    background: ${tokens.bg} !important;
    color: ${tokens.text} !important;
  }

  nav,
  nav > div,
  header nav {
    background: ${tokens.bg} !important;
    border-bottom: 1px solid ${tokens.border} !important;
  }

  nav a,
  nav button,
  header button {
    font-family: ${tokens.fontBody} !important;
    color: ${tokens.textSecondary} !important;
  }

  nav a[aria-current='page'],
  nav a.active {
    color: ${tokens.gold} !important;
  }

  /* Cards */
  [class*='Card'],
  [class*='card'] {
    border: 1px solid ${tokens.border} !important;
    border-radius: ${tokens.radius} !important;
    background: ${tokens.surface} !important;
    box-shadow: none !important;
  }

  /* Primary buttons */
  button[class*='pancake-button'],
  a[class*='pancake-button'] {
    border-radius: ${tokens.radiusSm} !important;
    font-family: ${tokens.fontBody} !important;
    font-weight: 600 !important;
    transition: opacity ${tokens.transition}, border-color ${tokens.transition} !important;
  }

  button[class*='pancake-button--primary'],
  a[class*='pancake-button--primary'] {
    background: ${tokens.gold} !important;
    color: ${tokens.bg} !important;
    border: 1px solid ${tokens.gold} !important;
  }

  button[class*='pancake-button--secondary'],
  a[class*='pancake-button--secondary'] {
    background: transparent !important;
    color: ${tokens.gold} !important;
    border: 1px solid ${tokens.borderGold} !important;
  }

  /* Inputs */
  input,
  select,
  textarea {
    background: ${tokens.surfaceSecondary} !important;
    border: 1px solid ${tokens.border} !important;
    border-radius: ${tokens.radiusSm} !important;
    color: ${tokens.text} !important;
    font-family: ${tokens.fontBody} !important;
  }

  input:focus,
  select:focus,
  textarea:focus {
    border-color: ${tokens.borderGold} !important;
    outline: none !important;
    box-shadow: none !important;
  }

  /* Modals */
  [role='dialog'],
  [class*='Modal'] {
    background: ${tokens.surface} !important;
    border: 1px solid ${tokens.border} !important;
    border-radius: ${tokens.radius} !important;
  }

  /* Subnav */
  [class*='SubMenuItems'],
  [class*='submenu'] {
    background: ${tokens.surface} !important;
    border-bottom: 1px solid ${tokens.border} !important;
  }

  /* Footer */
  footer {
    background: ${tokens.bg} !important;
    border-top: 1px solid ${tokens.border} !important;
    color: ${tokens.textSecondary} !important;
  }

  footer a {
    color: ${tokens.textSecondary} !important;
  }

  footer a:hover {
    color: ${tokens.gold} !important;
  }

  /* Remove legacy teal / purple link accents */
  a {
    color: inherit;
  }

  /* Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${tokens.surfaceSecondary};
    border-radius: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${tokens.bg};
  }
`

export default MelegaUIKitOverrides
