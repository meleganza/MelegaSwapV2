import React from 'react'
import styled from 'styled-components'
import { passportOne } from './passportTokens'
import { PassportAssetCardShell } from './PassportAssetCardShell'
import type { PassportAssetsViewModel } from './passportAssetsTypes'

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
`

const Label = styled.div`
  font-size: 10px;
  line-height: 13px;
  font-weight: 650;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${passportOne.muted};
`

const Value = styled.div`
  margin-top: 2px;
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
  color: ${passportOne.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Note = styled.p`
  margin: 8px 0 0;
  grid-column: 1 / -1;
  font-size: 11px;
  line-height: 15px;
  color: ${passportOne.secondary};
`

export const PassportAssetsMCreditsCard: React.FC<{
  mCredits: PassportAssetsViewModel['mCredits']
}> = ({ mCredits }) => (
  <PassportAssetCardShell
    title="M-Credits"
    status={mCredits.status}
    testId="passport-assets-mcredits"
    availability={mCredits.availability}
  >
    <Grid>
      <div>
        <Label>Balance</Label>
        <Value data-testid="passport-assets-mcredits-balance">{mCredits.balance}</Value>
      </div>
      <div>
        <Label>Status</Label>
        <Value>Unavailable</Value>
      </div>
      <div>
        <Label>Receiving Account</Label>
        <Value>{mCredits.receivingAccount}</Value>
      </div>
      <div>
        <Label>Actions</Label>
        <Value>
          {[
            mCredits.topUpSupported ? 'Top Up' : null,
            mCredits.spendSupported ? 'Spend' : null,
            mCredits.historySupported ? 'History' : null,
          ]
            .filter(Boolean)
            .join(' · ') || '—'}
        </Value>
      </div>
      <Note>Service-payment account — not an ERC-20 token and not a crypto wallet balance.</Note>
    </Grid>
  </PassportAssetCardShell>
)

export default PassportAssetsMCreditsCard
