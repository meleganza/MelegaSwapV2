import React from 'react'
import styled from 'styled-components'
import { colors, typography } from '../../tokens'
import { media } from '../../theme'

export interface MelegaSwapPanelShellProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  pairIndicator?: React.ReactNode
  toolbar?: React.ReactNode
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
  overflow: visible;
  box-sizing: border-box;
  box-shadow: none;

  @media (min-width: 768px) {
    width: 470px;
    max-width: 470px;
    height: 372px;
    max-height: 372px;
    flex-shrink: 0;
    overflow: hidden;
  }

  ${media.mobile} {
    border-radius: 20px;
    min-height: 0;
    max-height: none;
    height: auto;
  }
`

const Header = styled.div`
  position: relative;
  flex-shrink: 0;
  padding: 8px 18px 0;
  box-sizing: border-box;
`

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
  max-width: calc(100% - 200px);
  padding-bottom: 0;
`

const Title = styled.h1`
  margin: 0 0 4px;
  font-family: ${typography.fontFamily.body};
  font-size: 38px;
  font-weight: 800;
  color: ${colors.textPrimary};
  line-height: 40px;
`

const Subtitle = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: #b6b6b6;
  line-height: 16px;
`

const PairSlot = styled.div`
  position: absolute;
  top: 22px;
  right: 104px;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  pointer-events: none;
`

const Toolbar = styled.div`
  position: absolute;
  top: 12px;
  right: 18px;
  display: flex;
  align-items: center;
  gap: 8px;
`

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 0 18px;
  flex-shrink: 0;
`

export const SwapIconButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #121212;
  color: #b5b5b5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: color 150ms ease, border-color 150ms ease, background 150ms ease;

  &:hover {
    color: ${colors.textPrimary};
    border-color: rgba(255, 255, 255, 0.14);
    background: rgba(255, 255, 255, 0.04);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`

const Body = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 6px 16px 4px;

  .home-trade-swap {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: visible;
    gap: 8px;
  }

  ${media.mobile} {
    overflow: visible;
    padding: 12px 16px 18px;
  }
`

export const MelegaSwapPanelShell: React.FC<MelegaSwapPanelShellProps> = ({
  title = 'Swap',
  subtitle = 'Trade instantly on Melega DEX',
  pairIndicator,
  toolbar,
  children,
  ...rest
}) => (
  <Shell data-home-swap-panel data-swap-cockpit {...rest}>
    <Header>
      <TitleBlock>
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
      </TitleBlock>
      {pairIndicator && <PairSlot>{pairIndicator}</PairSlot>}
      {toolbar && <Toolbar>{toolbar}</Toolbar>}
    </Header>
    <Divider />
    <Body>{children}</Body>
  </Shell>
)

export default MelegaSwapPanelShell
