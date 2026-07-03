import { createGlobalStyle } from 'styled-components'
import { commandCenterColors, commandCenterLayout } from './commandCenterTokens'

const CommandCenterGlobalStyle = createGlobalStyle`
  [data-command-center-screen] {
    color: ${commandCenterColors.white};
    background: ${commandCenterColors.pageBg};
  }
`

export default CommandCenterGlobalStyle
