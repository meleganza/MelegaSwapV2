import React from 'react'
import styled from 'styled-components'
import { colors, typography } from '../../tokens'
import { media } from '../../theme'

export interface MelegaSwapPanelShellProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  headerMeta?: React.ReactNode
  toolbar?: React.ReactNode
  children: React.ReactNode
}

const Shell = styled.div`
  background: linear-gradient(180deg, #141414 0%, #101010 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 0 16px 12px;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: visible;
  box-sizing: border-box;
  box-shadow: none;

  @media (min-width: 768px) {
    width: 470px;
    max-width: 470px;
    height: 380px;
    max-height: 380px;
    flex-shrink: 0;
    overflow: hidden;
  }

  ${media.mobile} {
    border-radius: 20px;
    min-height: 500px;
    max-height: none;
    height: auto;
  }
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  height: 58px;
  min-height: 58px;
  gap: 10px;
`

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`

const Title = styled.h1`
  margin: 0;
  font-family: ${typography.fontFamily.body};
  font-size: 38px;
  font-weight: 800;
  color: ${colors.textPrimary};
  line-height: 1;
`

const Subtitle = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: #b6b6b6;
  line-height: 1.2;
`

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: auto;
`

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.05);
  margin: 0 0 12px;
  flex-shrink: 0;
`

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`

export const SwapIconButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  color: ${colors.textSecondary};
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

  .home-trade-swap {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
  }

  ${media.mobile} {
    overflow: visible;
  }
`

export const MelegaSwapPanelShell: React.FC<MelegaSwapPanelShellProps> = ({
  title = 'Swap',
  subtitle = 'Trade instantly on Melega DEX',
  headerMeta,
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
      <HeaderRight>
        {headerMeta}
        {toolbar && <Toolbar>{toolbar}</Toolbar>}
      </HeaderRight>
    </Header>
    <Divider />
    <Body>{children}</Body>
  </Shell>
)

export default MelegaSwapPanelShell
