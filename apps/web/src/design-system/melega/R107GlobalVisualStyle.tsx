import { createGlobalStyle } from 'styled-components'
import { R107_VISUAL } from './constants/r107-visual'

/** R107 — cross-studio visual stabilization overrides. */
const R107GlobalVisualStyle = createGlobalStyle`
  [data-farms-studio-screen],
  [data-pools-studio-screen],
  [data-projects-studio-screen],
  [data-trending-studio-screen],
  [data-radar-studio-screen],
  [data-command-center-screen],
  [data-collectibles-studio-screen],
  [data-build-studio-screen],
  [data-import-existing-token-screen],
  [data-trade-terminal-screen],
  [data-liquidity-studio-screen],
  [data-home-trade-screen] {
    max-width: 100vw;
    overflow-x: hidden;
    box-sizing: border-box;
  }

  @media (max-width: 767px) {
    [data-farms-studio-screen],
    [data-pools-studio-screen],
    [data-projects-studio-screen],
    [data-trending-studio-screen],
    [data-radar-studio-screen],
    [data-command-center-screen],
    [data-collectibles-studio-screen],
    [data-build-studio-screen],
    [data-import-existing-token-screen],
    [data-trade-terminal-screen],
    [data-liquidity-studio-screen],
    [data-home-trade-screen] {
      padding-bottom: ${R107_VISUAL.mobileBottomPad};
    }
  }
`

export default R107GlobalVisualStyle
