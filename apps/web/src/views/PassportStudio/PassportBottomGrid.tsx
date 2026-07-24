/**
 * PASSPORT bottom row layout.
 * Left: Module 006 Recent Activity (frozen). Right: Module 007 Security.
 */
import React from 'react'
import styled from 'styled-components'
import { passportOne } from './passportTokens'
import { PassportActivity, type PassportActivityProps } from './PassportActivity'
import { PassportSecurity, type PassportSecurityProps } from './PassportSecurity'

const Grid = styled.div`
  width: 100%;
  max-width: ${passportOne.contentMax};
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: ${passportOne.bottomGap};
  min-width: 0;
  box-sizing: border-box;

  @media (max-width: 1199px) {
    flex-direction: column;
    gap: 16px;
  }
`

export type PassportBottomGridProps = PassportActivityProps & {
  security?: PassportSecurityProps
}

export const PassportBottomGrid: React.FC<PassportBottomGridProps> = ({
  security,
  ...activityProps
}) => (
  <Grid data-testid="passport-bottom-grid" data-passport-bottom-grid="680+16+680">
    <PassportActivity {...activityProps} />
    <PassportSecurity {...security} />
  </Grid>
)

export default PassportBottomGrid
