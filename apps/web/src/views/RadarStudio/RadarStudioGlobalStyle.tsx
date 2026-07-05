import { createGlobalStyle } from 'styled-components'
import { radarStudioColors } from './radarStudioTokens'

const RadarStudioGlobalStyle = createGlobalStyle`
  [data-radar-studio-screen] {
    color: ${radarStudioColors.text};
    background: ${radarStudioColors.canvas};
  }
`

export default RadarStudioGlobalStyle
