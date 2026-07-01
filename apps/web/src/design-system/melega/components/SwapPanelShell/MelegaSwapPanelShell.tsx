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
  /** home = 470×404 cockpit; trade = 560px contained width */
  size?: 'home' | 'trade'
}

const Shell = styled.div<{ $size?: 'home' | 'trade' }>`
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
    width: ${({ $size }) => ($size === 'trade' ? '560px' : '470px')};
    max-width: ${({ $size }) => ($size === 'trade' ? '560px' : '470px')};
    flex-shrink: 0;
    overflow: hidden;

    ${({ $size }) =>
      $size === 'trade'
        ? `
      height: auto;
      min-height: 0;
      max-height: none;
    `
        : `
      height: 404px;
      min-height: 404px;
      max-height: 404px;
    `}
  }

  ${media.mobile} {
    border-radius: 20px;
    min-height: 0;
    max-height: none;
    height: auto;
  }
`

const Header = styled.div<{ $size?: 'home' | 'trade' }>`
  position: relative;
  flex-shrink: 0;
  padding: ${({ $size }) => ($size === 'home' ? '28px' : '18px')} 20px 0;
  box-sizing: border-box;
`

const InnerStack = styled.div<{ $size?: 'home' | 'trade' }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  transform: ${({ $size }) => ($size === 'home' ? 'translateY(10px)' : 'none')};
`

const TitleBlock = styled.div<{ $size?: 'home' | 'trade' }>`
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: 0;
  max-width: ${({ $size }) => ($size === 'home' ? '210px' : 'calc(100% - 200px)')};
  padding-bottom: 8px;
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
  margin: 4px 0 0;
  font-size: 13px;
  font-weight: 500;
  color: #b6b6b6;
  line-height: 16px;
`

const PairSlot = styled.div<{ $size?: 'home' | 'trade' }>`
  position: absolute;
  top: ${({ $size }) => ($size === 'home' ? '38px' : '30px')};
  right: ${({ $size }) => ($size === 'home' ? '112px' : '156px')};
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  max-width: ${({ $size }) => ($size === 'home' ? '128px' : '150px')};
  font-size: 12px;
  font-weight: 600;
  line-height: 16px;
  color: #8a8a8a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: right;
  pointer-events: none;
`

const Toolbar = styled.div<{ $size?: 'home' | 'trade' }>`
  position: absolute;
  top: ${({ $size }) => ($size === 'home' ? '28px' : '18px')};
  right: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`

const Divider = styled.div<{ $size?: 'home' | 'trade' }>`
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: ${({ $size }) => ($size === 'home' ? '4px' : '10px')} 20px 0;
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

const Body = styled.div<{ $size?: 'home' | 'trade' }>`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 20px ${({ $size }) => ($size === 'home' ? '28px' : '18px')};

  .home-trade-swap {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: hidden;
    gap: 0;
  }

  ${media.mobile} {
    overflow: visible;
    padding: 12px 16px ${({ $size }) => ($size === 'home' ? '28px' : '18px')};
  }
`

export const MelegaSwapPanelShell: React.FC<MelegaSwapPanelShellProps> = ({
  title = 'Swap',
  subtitle = 'Trade instantly on Melega DEX',
  pairIndicator,
  toolbar,
  children,
  size = 'home',
  ...rest
}) => (
  <Shell
    className={size === 'home' ? 'home-swap-cockpit' : undefined}
    data-home-swap-panel
    data-swap-cockpit
    data-swap-size={size}
    $size={size}
    {...rest}
  >
    <InnerStack $size={size}>
      <Header $size={size}>
        <TitleBlock $size={size}>
          <Title>{title}</Title>
          <Subtitle>{subtitle}</Subtitle>
        </TitleBlock>
        {pairIndicator && <PairSlot $size={size}>{pairIndicator}</PairSlot>}
        {toolbar && <Toolbar $size={size}>{toolbar}</Toolbar>}
      </Header>
      <Divider $size={size} />
      <Body $size={size}>{children}</Body>
    </InnerStack>
  </Shell>
)

export default MelegaSwapPanelShell
