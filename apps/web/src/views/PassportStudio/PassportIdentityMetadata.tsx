import React from 'react'
import styled from 'styled-components'
import { passportOne } from './passportTokens'
import type { PassportAccountType } from './passportHeroIdentityTypes'

const Grid = styled.div`
  display: grid;
  grid-template-columns: 145px 145px;
  column-gap: 16px;
  row-gap: 10px;
  margin-top: 0;
  width: 100%;
  max-width: 310px;

  @media (max-width: 767px) {
    grid-template-columns: repeat(2, minmax(132px, 1fr));
    max-width: 100%;

    @media (max-width: 359px) {
      grid-template-columns: 1fr;
    }
  }
`

const Cell = styled.div`
  min-width: 0;
`

const Label = styled.div`
  font-size: 10px;
  line-height: 13px;
  font-weight: 650;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${passportOne.muted};
`

const Value = styled.div`
  margin-top: 4px;
  font-size: 13px;
  line-height: 18px;
  font-weight: 700;
  color: ${passportOne.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const PassportIdentityMetadata: React.FC<{
  memberSince: string
  accountType: PassportAccountType
}> = ({ memberSince, accountType }) => (
  <Grid data-testid="passport-identity-metadata">
    <Cell>
      <Label>Member Since</Label>
      <Value data-testid="passport-member-since">{memberSince}</Value>
    </Cell>
    <Cell>
      <Label>Account Type</Label>
      <Value data-testid="passport-account-type">{accountType}</Value>
    </Cell>
  </Grid>
)

export default PassportIdentityMetadata
