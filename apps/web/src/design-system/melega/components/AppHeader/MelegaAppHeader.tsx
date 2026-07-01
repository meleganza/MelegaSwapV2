import React from 'react'
import styled from 'styled-components'
import { MELEGA_SIDEBAR_WIDTH } from '../Sidebar/MelegaSidebar'

const Bar = styled.header`
  display: none;
  position: fixed;
  top: 0;
  right: 0;
  left: ${MELEGA_SIDEBAR_WIDTH};
  height: 60px;
  z-index: 90;
  background: transparent;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  padding: 0 24px;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  box-shadow: none;

  @media (min-width: 768px) {
    display: flex;
  }
`

const Left = styled.div`
  display: flex;
  align-items: center;
  height: 60px;
  min-width: 0;
`

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  height: 60px;
  margin-left: auto;
  flex-shrink: 0;

  & > * {
    display: inline-flex;
    align-items: center;
    align-self: center;
    flex-shrink: 0;
    height: 40px;
  }
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

export const MELEGA_APP_HEADER_HEIGHT = '60px'

export default MelegaAppHeader
