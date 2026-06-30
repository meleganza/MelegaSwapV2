import React from 'react'
import styled from 'styled-components'
import { colors, typography, spacing, radius } from '../../tokens'

export interface MelegaSwapPanelShellProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  toolbar?: React.ReactNode
  children: React.ReactNode
}

const Shell = styled.div`
  background: linear-gradient(180deg, ${colors.surface2} 0%, ${colors.surface1} 100%);
  border: 1px solid ${colors.borderStrong};
  border-radius: ${radius.xl};
  padding: ${spacing[4]};
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
`

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-shrink: 0;
  margin-bottom: ${spacing[1]};
`

const Title = styled.h1`
  margin: 0;
  font-family: ${typography.fontFamily.body};
  font-size: ${typography.fontSize['3xl']};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.textPrimary};
  line-height: 1.1;
`

const Subtitle = styled.p`
  margin: 2px 0 0;
  font-size: ${typography.fontSize.base};
  color: ${colors.textSecondary};
  line-height: 1.35;
`

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: ${spacing[1]};
`

const Body = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
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
