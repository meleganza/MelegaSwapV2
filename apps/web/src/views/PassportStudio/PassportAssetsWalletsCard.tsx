import React from 'react'
import styled from 'styled-components'
import { passportOne } from './passportTokens'
import { PassportAssetCardShell } from './PassportAssetCardShell'
import type { PassportAssetsViewModel } from './passportAssetsTypes'

const Empty = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: ${passportOne.secondary};
`

const Row = styled.div`
  border: 1px solid ${passportOne.border};
  border-radius: 10px;
  background: ${passportOne.elevated};
  padding: 10px 12px;
`

const Name = styled.div`
  font-size: 13px;
  line-height: 16px;
  font-weight: 700;
  color: ${passportOne.text};
`

const Meta = styled.div`
  margin-top: 4px;
  font-size: 11px;
  line-height: 15px;
  color: ${passportOne.secondary};
`

const Badge = styled.span`
  margin-left: 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${passportOne.gold};
`

export const PassportAssetsWalletsCard: React.FC<{
  wallets: PassportAssetsViewModel['wallets']
}> = ({ wallets }) => (
  <PassportAssetCardShell
    title="Linked Wallets"
    status={wallets.status}
    testId="passport-assets-wallets"
    availability={wallets.availability}
  >
    {wallets.rows.length === 0 ? (
      <Empty>{wallets.status}</Empty>
    ) : (
      wallets.rows.slice(0, 1).map((w) => (
        <Row key={w.addressShort} data-testid="passport-assets-wallet-row">
          <Name>
            {w.name}
            {w.primary ? <Badge>Primary</Badge> : null}
          </Name>
          <Meta>
            {w.chain} · {w.addressShort} · {w.connection}
          </Meta>
        </Row>
      ))
    )}
  </PassportAssetCardShell>
)

export default PassportAssetsWalletsCard
