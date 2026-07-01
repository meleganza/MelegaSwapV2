import React from 'react'
import styled from 'styled-components'
import { colors, typography } from '../../tokens'
import { media } from '../../theme'

export interface MelegaSwapPanelShellProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  toolbar?: React.ReactNode
  children: React.ReactNode
}

const Shell = styled.div`
  background: #101010;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  padding: 0 18px 14px;
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
  height: 60px;
  min-height: 60px;
`

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Title = styled.h1`
  margin: 0;
  font-family: ${typography.fontFamily.body};
  font-size: 42px;
  font-weight: 800;
  color: ${colors.textPrimary};
  line-height: 1;
`

const Subtitle = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: #b6b6b6;
  line-height: 1.35;
`

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 0 0 10px;
  flex-shrink: 0;
`

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

export const SwapIconButton = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.025);
  color: ${colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: color 150ms ease, border-color 150ms ease;

  &:hover {
    color: ${colors.textPrimary};
    border-color: rgba(255, 255, 255, 0.14);
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
  overflow: visible;

  .home-trade-swap {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: visible;
  }

  ${media.mobile} {
    overflow: visible;
  }
`

export const MelegaSwapPanelShell: React.FC<MelegaSwapPanelShellProps> = ({
  title = 'Swap',
  subtitle = 'Trade instantly on Melega DEX',
  toolbar,
  children,
  ...rest
}) => (
  <Shell data-home-swap-panel {...rest}>
    <Header>
      <TitleBlock>
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
      </TitleBlock>
      {toolbar && <Toolbar>{toolbar}</Toolbar>}
    </Header>
    <Divider />
    <Body>{children}</Body>
  </Shell>
)

export default MelegaSwapPanelShell
