import React from 'react'
import styled from 'styled-components'
import { colors, typography } from 'design-system/melega/tokens'
import { media } from 'design-system/melega/theme'

export interface HomeSwapPanelShellProps extends React.HTMLAttributes<HTMLDivElement> {
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
  overflow: hidden;
  box-sizing: border-box;
  box-shadow: none;

  @media (min-width: 768px) {
    width: 470px;
    max-width: 470px;
    height: 408px;
    min-height: 408px;
    max-height: 408px;
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
  height: 100%;
  padding: 24px 24px 24px 24px;
  box-sizing: border-box;
  overflow: hidden;
`

const Header = styled.div`
  position: relative;
  flex-shrink: 0;
  box-sizing: border-box;
`

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  max-width: calc(100% - 100px);
`

const Title = styled.h1`
  margin: 0;
  font-family: ${typography.fontFamily.body};
  font-size: 38px;
  font-weight: 800;
  color: #ffffff;
  line-height: 40px;
`

const Subtitle = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: #a8a8a8;
  line-height: 16px;
`

const PairSlot = styled.div`
  position: absolute;
  top: 42px;
  right: 112px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  max-width: 150px;
  font-size: 12px;
  font-weight: 600;
  line-height: 14px;
  color: #8a8a8a;
  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;
  text-align: right;
  pointer-events: none;
`

const Toolbar = styled.div`
  position: absolute;
  top: 28px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`

const Divider = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 10px 0 0;
  flex-shrink: 0;
`

export const HomeSwapIconButton = styled.button`
  width: 38px;
  height: 38px;
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
  margin-top: 8px;

  .home-trade-swap {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
    gap: 0;
    justify-content: flex-end;
  }

  ${media.mobile} {
    overflow: visible;
  }
`

export const HomeSwapPanelShell: React.FC<HomeSwapPanelShellProps> = ({
  title = 'Swap',
  subtitle = 'Trade instantly on Melega DEX',
  pairIndicator,
  toolbar,
  children,
  ...rest
}) => (
  <Shell className="home-swap-cockpit" data-home-swap-panel data-home-swap-shell {...rest}>
    <Inner>
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
    </Inner>
  </Shell>
)

export default HomeSwapPanelShell
