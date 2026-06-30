import React from 'react'
import styled from 'styled-components'
import { colors, spacing } from '../../tokens'

const ASIDE_WIDTH = '230px'
const SIDEBAR_BG = '#050505'

const Aside = styled.aside`
  display: none;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: ${ASIDE_WIDTH};
  background: ${SIDEBAR_BG};
  border-right: 1px solid rgba(255, 255, 255, 0.07);
  padding: 22px 14px 18px;
  z-index: 100;
  box-sizing: border-box;
  flex-direction: column;

  @media (min-width: 768px) {
    display: flex;
    overflow: hidden;
  }
`

const BrandRow = styled.div`
  height: 46px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
`

const NavScroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 0;
  }
`

const Bottom = styled.div`
  flex-shrink: 0;
  margin-top: ${spacing[3]};
  padding-top: ${spacing[3]};
`

export const MELEGA_SIDEBAR_WIDTH = ASIDE_WIDTH

export interface MelegaSidebarProps {
  brand: React.ReactNode
  navigation: React.ReactNode
  footer?: React.ReactNode
}

export const MelegaSidebar: React.FC<MelegaSidebarProps> = ({ brand, navigation, footer }) => (
  <Aside data-melega-sidebar>
    <BrandRow>{brand}</BrandRow>
    <NavScroll>{navigation}</NavScroll>
    {footer && <Bottom>{footer}</Bottom>}
  </Aside>
)

export default MelegaSidebar
