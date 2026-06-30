import styled from 'styled-components'
import { Card } from '@pancakeswap/uikit'
import { melegaOperational as tokens } from 'ui/tokens'

export const BodyWrapper = styled(Card)`
  border-radius: ${tokens.radiusLg};
  max-width: 436px;
  width: 100%;
  z-index: 1;
  border: 1px solid ${tokens.border};
  background: ${tokens.surface};
  box-shadow: none;
  margin: 10px auto;
  overflow: hidden;
`

/**
 * The styled container element that wraps the content of most pages and the tabs.
 */
export default function AppBody({ children }: { children: React.ReactNode }) {
  return <BodyWrapper data-melega-trading-card="true">{children}</BodyWrapper>
}
