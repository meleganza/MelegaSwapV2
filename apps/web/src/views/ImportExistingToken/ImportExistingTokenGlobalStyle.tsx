import { createGlobalStyle } from 'styled-components'
import { importTokenColors, importTokenLayout } from './importTokenTokens'

const ImportExistingTokenGlobalStyle = createGlobalStyle`
  @property --ring-angle {
    syntax: '<angle>';
    inherits: false;
    initial-value: 0deg;
  }

  [data-import-existing-token-screen] {
    color: ${importTokenColors.white};
    background: ${importTokenColors.pageBg};
  }

  [data-import-existing-token-screen] [data-iet-panel],
  [data-import-existing-token-screen] [data-iet-contract-hero],
  [data-import-existing-token-screen] [data-iet-discovery-pipeline],
  [data-import-existing-token-screen] [data-iet-project-detected],
  [data-import-existing-token-screen] [data-iet-readiness-score],
  [data-import-existing-token-screen] [data-iet-suggestions],
  [data-import-existing-token-screen] [data-iet-service-activation],
  [data-import-existing-token-screen] [data-iet-ai-manifest],
  [data-import-existing-token-screen] [data-iet-advisor],
  [data-import-existing-token-screen] [data-iet-recent-imports] {
    transition: transform ${importTokenLayout.transition} ease, border-color ${importTokenLayout.transition} ease;
  }

  @media (max-width: 768px) {
    [data-import-existing-token-screen] [data-iet-contract-hero] [data-iet-contract-input] {
      width: 100% !important;
      min-width: 0 !important;
      max-width: 100% !important;
      box-sizing: border-box;
    }

    [data-import-existing-token-screen] [data-iet-contract-hero] button[data-iet-primary],
    [data-import-existing-token-screen] [data-iet-contract-hero] button:last-of-type {
      width: 100% !important;
    }
  }
`

export default ImportExistingTokenGlobalStyle
