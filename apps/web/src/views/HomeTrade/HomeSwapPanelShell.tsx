import React from 'react'
import styled from 'styled-components'
import { colors } from 'design-system/melega/tokens'
import { media } from 'design-system/melega/theme'

export interface HomeSwapPanelShellProps extends React.HTMLAttributes<HTMLDivElement> {
  /** @deprecated Large title removed — header is composed by HomeSwapPanel. */
  title?: string
  /** @deprecated Subtitle removed for final pixel header. */
  subtitle?: string
  pairIndicator?: React.ReactNode
  toolbar?: React.ReactNode
  headerLeading?: React.ReactNode
  children: React.ReactNode
}

const Shell = styled.div`
  position: relative;
  background: linear-gradient(180deg, #141414 0%, #101010 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  margin: 0 auto;

  @media (min-width: 768px) {
    width: 440px;
    max-width: 440px;
    min-height: 0;
    height: auto;
    flex-shrink: 0;
  }

  ${media.mobile} {
    border-radius: 20px;
    min-height: 0;
    max-height: none;
    height: auto;
  }
`

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 14px 16px 16px;
  box-sizing: border-box;
`

const Header = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 10px;
  flex-shrink: 0;
  margin-bottom: 8px;
`

const PairSlot = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #8a8a8a;
  white-space: nowrap;
`

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  margin-left: auto;
`

export const HomeSwapIconButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #121212;
  color: #b5b5b5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  &:hover {
    color: ${colors.textPrimary};
    border-color: rgba(255, 255, 255, 0.14);
  }

  svg {
    width: 15px;
    height: 15px;
  }
`

const Body = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  .home-trade-swap {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    gap: 0;
  }
`

export const HomeSwapPanelShell: React.FC<HomeSwapPanelShellProps> = ({
  pairIndicator,
  toolbar,
  headerLeading,
  children,
  ...rest
}) => (
  <Shell className="home-swap-cockpit" data-home-swap-panel data-home-swap-shell data-final-pixel="true" {...rest}>
    <Inner>
      <Header data-home-swap-header data-single-header-row="true">
        {headerLeading}
        {pairIndicator && <PairSlot>{pairIndicator}</PairSlot>}
        {toolbar && <Toolbar>{toolbar}</Toolbar>}
      </Header>
      <Body>{children}</Body>
    </Inner>
  </Shell>
)

export default HomeSwapPanelShell
