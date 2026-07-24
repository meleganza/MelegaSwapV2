/**
 * PASSPORT_MODULE_007 — Security trust summary (desktop 680×360 exact).
 * Bottom-grid right column. Does not invent scores, sessions, recovery, or alerts.
 */
import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { passportOne } from './passportTokens'
import {
  usePassportSecurity,
  type UsePassportSecurityOptions,
} from './usePassportSecurity'
import type { PassportSecurityRow, PassportSecurityViewModel } from './passportSecurityTypes'

const Module = styled.section`
  position: relative;
  width: ${passportOne.bottomColW};
  max-width: 100%;
  height: ${passportOne.securityH};
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: linear-gradient(145deg, rgba(17, 17, 17, 0.99) 0%, rgba(12, 12, 12, 0.99) 100%);
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.27), inset 0 1px 0 rgba(255, 255, 255, 0.03);
  font-family: ${passportOne.font};
  color: ${passportOne.text};
  flex-shrink: 0;

  @media (max-width: 1199px) {
    width: 100%;
    height: auto;
    overflow: visible;
  }

  @media (max-width: 767px) {
    width: 100%;
    max-width: none;
    height: auto;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
`

const Header = styled.header`
  height: 64px;
  padding: 0 18px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;

  @media (max-width: 767px) {
    height: 56px;
    padding: 0 16px;
  }
`

const Title = styled.h2`
  margin: 0;
  font-size: 16px;
  line-height: 22px;
  font-weight: 750;
  color: ${passportOne.text};
`

const Subtitle = styled.p`
  margin: 2px 0 0;
  font-size: 11px;
  line-height: 15px;
  font-weight: 400;
  color: ${passportOne.muted};

  @media (max-width: 767px) {
    display: none;
  }
`

const Body = styled.div`
  height: calc(360px - 64px);
  padding: 2px 18px 0;
  box-sizing: border-box;

  @media (max-width: 1199px) {
    height: auto;
    padding: 0 16px 16px;
  }
`

const List = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Row = styled.li`
  list-style: none;
  height: 52px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 10px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.02);

  @media (max-width: 767px) {
    height: auto;
    min-height: 52px;
    padding: 10px;
  }
`

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
`

const Icon = styled.div`
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 9px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  color: ${passportOne.secondary};
  font-size: 11px;
  font-weight: 750;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`

const Meta = styled.div`
  min-width: 0;
`

const RowTitle = styled.div`
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
  color: ${passportOne.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const RowDesc = styled.div`
  font-size: 11px;
  line-height: 15px;
  color: ${passportOne.muted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`

const Badge = styled.span<{ $tone: PassportSecurityRow['badgeTone'] }>`
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 650;
  white-space: nowrap;
  ${({ $tone }) => {
    if ($tone === 'positive')
      return `color:#0d3d24;background:rgba(22,217,119,0.16);border:1px solid rgba(22,217,119,0.32);`
    if ($tone === 'warning')
      return `color:${passportOne.gold};background:rgba(221,185,47,0.12);border:1px solid rgba(221,185,47,0.32);`
    if ($tone === 'attention')
      return `color:#F4B942;background:rgba(244,185,66,0.12);border:1px solid rgba(244,185,66,0.32);`
    return `color:${passportOne.secondary};background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);`
  }}
`

const Action = styled(Link)`
  height: 28px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid ${passportOne.borderStrong};
  background: ${passportOne.elevated};
  color: ${passportOne.text};
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${passportOne.gold};
    outline-offset: 2px;
  }
`

const Center = styled.div`
  height: 100%;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 14px;
  padding: 16px;
`

const CenterTitle = styled.div`
  font-size: 15px;
  line-height: 20px;
  font-weight: 750;
  max-width: 320px;
`

export type PassportSecurityProps = UsePassportSecurityOptions & {
  model?: PassportSecurityViewModel
}

export const PassportSecurity: React.FC<PassportSecurityProps> = ({
  model: injected,
  fixtureRows,
  forceDisconnected,
}) => {
  const live = usePassportSecurity({ fixtureRows, forceDisconnected })
  const model = injected ?? live

  return (
    <Module
      data-testid="passport-security-module"
      data-passport-module="007"
      data-pixel-passport-security="680x360"
      data-security-state={model.state}
      aria-label="Security"
    >
      <Header data-testid="passport-security-header">
        <Title>Security</Title>
        {model.state !== 'disconnected' ? (
          <Subtitle>Security and trust status for your Passport.</Subtitle>
        ) : null}
      </Header>

      <Body>
        {model.state === 'disconnected' ? (
          <Center data-testid="passport-security-disconnected">
            <CenterTitle>Connect your wallet to review Passport security.</CenterTitle>
            <ConnectWalletButton>Connect Wallet</ConnectWalletButton>
          </Center>
        ) : (
          <List data-testid="passport-security-list">
            {model.rows.map((row) => (
              <Row key={row.id} data-testid={`passport-security-row-${row.id}`}>
                <Left>
                  <Icon aria-hidden="true">{row.iconMark}</Icon>
                  <Meta>
                    <RowTitle>{row.title}</RowTitle>
                    <RowDesc>{row.description}</RowDesc>
                  </Meta>
                </Left>
                <Right>
                  <Badge $tone={row.badgeTone}>{row.badge}</Badge>
                  {row.actionLabel && row.actionHref ? (
                    <Action href={row.actionHref} aria-label={row.actionAriaLabel || row.actionLabel}>
                      {row.actionLabel}
                    </Action>
                  ) : null}
                </Right>
              </Row>
            ))}
          </List>
        )}
      </Body>
    </Module>
  )
}

export default PassportSecurity
