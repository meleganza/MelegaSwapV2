/**
 * PASSPORT_MODULE_006 — desktop bottom row layout.
 * Left: Recent Activity (owned). Right: reserved Security slot (not implemented).
 */
import React from 'react'
import styled from 'styled-components'
import { passportOne } from './passportTokens'
import { PassportActivity, type PassportActivityProps } from './PassportActivity'

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

/**
 * Geometry reserve for Module 007 only — not a Security implementation.
 * Do not mount PassportSecurity here.
 */
const SecurityReserve = styled.aside`
  width: ${passportOne.bottomColW};
  height: ${passportOne.activityH};
  max-width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;
  border-radius: 16px;
  border: 1px dashed rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.015);
  pointer-events: none;

  @media (max-width: 1199px) {
    width: 100%;
    height: 120px;
  }

  @media (max-width: 767px) {
    height: 80px;
  }
`

export type PassportBottomGridProps = PassportActivityProps

export const PassportBottomGrid: React.FC<PassportBottomGridProps> = (props) => (
  <Grid data-testid="passport-bottom-grid" data-passport-bottom-grid="680+16+680">
    <PassportActivity {...props} />
    <SecurityReserve
      data-testid="passport-security-reserve"
      data-passport-module-007-reserve="true"
      aria-hidden="true"
    />
  </Grid>
)

export default PassportBottomGrid
