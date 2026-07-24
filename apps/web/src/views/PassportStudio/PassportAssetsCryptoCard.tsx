import React from 'react'
import styled from 'styled-components'
import { passportOne } from './passportTokens'
import { PassportAssetCardShell } from './PassportAssetCardShell'
import type { PassportAssetsViewModel } from './passportAssetsTypes'
import { ASSETS_UNAVAILABLE } from './passportAssetsTypes'

const Empty = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: ${passportOne.secondary};
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 28px 1fr auto;
  gap: 8px;
  align-items: center;
  margin-bottom: 8px;
`

const Logo = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid ${passportOne.borderStrong};
  background: ${passportOne.elevated};
  color: ${passportOne.gold};
  font-size: 10px;
  font-weight: 750;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`

const Meta = styled.div`
  min-width: 0;
`

const Sym = styled.div`
  font-size: 13px;
  line-height: 16px;
  font-weight: 700;
  color: ${passportOne.text};
`

const Sub = styled.div`
  font-size: 11px;
  line-height: 14px;
  color: ${passportOne.muted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Bal = styled.div`
  text-align: right;
  font-size: 12px;
  line-height: 16px;
  font-weight: 700;
  color: ${passportOne.text};
`

export const PassportAssetsCryptoCard: React.FC<{ crypto: PassportAssetsViewModel['crypto'] }> = ({
  crypto,
}) => (
  <PassportAssetCardShell
    title="Crypto Assets"
    status={crypto.status}
    testId="passport-assets-crypto"
    availability={crypto.availability}
  >
    {crypto.rows.length === 0 ? (
      <Empty data-testid="passport-assets-crypto-empty">{crypto.status}</Empty>
    ) : (
      crypto.rows.slice(0, 2).map((row) => (
        <Row key={`${row.symbol}-${row.wallet}`}>
          <Logo aria-hidden="true">{row.symbol.slice(0, 2)}</Logo>
          <Meta>
            <Sym>{row.symbol}</Sym>
            <Sub>
              {row.chain ?? ASSETS_UNAVAILABLE} · {row.wallet ?? ASSETS_UNAVAILABLE}
              {row.trend ? ` · ${row.trend}` : ''}
            </Sub>
          </Meta>
          <Bal>
            <div>{row.balance}</div>
            <Sub>{row.valueUsd ?? ASSETS_UNAVAILABLE}</Sub>
          </Bal>
        </Row>
      ))
    )}
  </PassportAssetCardShell>
)

export default PassportAssetsCryptoCard
