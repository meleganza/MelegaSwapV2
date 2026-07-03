import { createGlobalStyle } from 'styled-components'
import { commandCenterColors } from './commandCenterTokens'

const CommandCenterGlobalStyle = createGlobalStyle`
  [data-command-center-screen] {
    color: ${commandCenterColors.white};
    background: ${commandCenterColors.pageBg};
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
    box-sizing: border-box;
  }

  [data-command-center-screen] * {
    box-sizing: border-box;
  }
`

export default CommandCenterGlobalStyle
