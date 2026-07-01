import React from 'react'
import styled from 'styled-components'
import { colors, typography, spacing, radius } from '../../tokens'
import { media } from '../../theme'

export interface MelegaSwapPanelShellProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  toolbar?: React.ReactNode
  children: React.ReactNode
}

const Shell = styled.div`
  background: linear-gradient(180deg, #111111 0%, #080808 100%);
  border: 1px solid rgba(212, 175, 55, 0.22);
  border-radius: ${radius['2xl']};
  padding: 18px;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
  box-shadow: none;

  @media (min-width: 768px) {
    width: 500px;
    max-width: 500px;
    height: 360px;
    max-height: 360px;
    flex-shrink: 0;
  }

  ${media.mobile} {
    border-radius: ${radius.panel};
    min-height: 500px;
    max-height: none;
    height: auto;
  }
`

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-shrink: 0;
  height: 40px;
  margin-bottom: 4px;
`

const Title = styled.h1`
  margin: 0;
  font-family: ${typography.fontFamily.body};
  font-size: 28px;
  font-weight: ${typography.fontWeight.extrabold};
  color: ${colors.textPrimary};
  line-height: 1;
`

const Subtitle = styled.p`
  margin: 4px 0 0;
  font-size: ${typography.fontSize.base};
  color: ${colors.textSecondary};
  line-height: 1.35;
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
  overflow: hidden;

  ${media.mobile} {
    overflow: visible;
  }
`

export const MelegaSwapPanelShell: React.FC<MelegaSwapPanelShellProps> = ({
  title = 'Swap',
  subtitle = 'Trade tokens instantly on Melega DEX.',
  toolbar,
  children,
  ...rest
}) => (
  <Shell data-home-swap-panel {...rest}>
    <Header>
      <div>
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
      </div>
      {toolbar && <Toolbar>{toolbar}</Toolbar>}
    </Header>
    <Body>{children}</Body>
  </Shell>
)

export default MelegaSwapPanelShell
