import React from 'react'
import styled from 'styled-components'
import { colors, spacing } from '../../tokens'
import { MELEGA_SIDEBAR_WIDTH } from '../Sidebar/MelegaSidebar'

const Bar = styled.header`
  display: none;
  position: fixed;
  top: 0;
  right: 0;
  left: ${MELEGA_SIDEBAR_WIDTH};
  height: 56px;
  z-index: 90;
  background: ${colors.canvas};
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  padding: 0 26px;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing[3]};
  box-shadow: none;

  @media (min-width: 768px) {
    display: flex;
  }
`

const Left = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
`

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  margin-left: auto;
  flex-shrink: 0;
`

export interface MelegaAppHeaderProps {
  left?: React.ReactNode
  right?: React.ReactNode
}

export const MelegaAppHeader: React.FC<MelegaAppHeaderProps> = ({ left, right }) => (
  <Bar data-melega-app-header>
    <Left>{left}</Left>
    <Right>{right}</Right>
  </Bar>
)

export const MELEGA_APP_HEADER_HEIGHT = '56px'

export default MelegaAppHeader
