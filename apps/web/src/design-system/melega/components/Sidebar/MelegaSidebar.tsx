import React from 'react'
import styled from 'styled-components'
import { colors } from '../../tokens'

const ASIDE_WIDTH = '228px'
const SIDEBAR_BG = '#050505'

const Aside = styled.aside`
  display: none;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: ${ASIDE_WIDTH};
  background: ${SIDEBAR_BG};
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  padding: 0 0 16px;
  z-index: 100;
  box-sizing: border-box;
  flex-direction: column;
  box-shadow: none;

  @media (min-width: 768px) {
    display: flex;
    overflow: hidden;
  }
`

const BrandRow = styled.div`
  flex-shrink: 0;
  padding: 20px 0 0 18px;
  margin-bottom: 18px;
  min-width: 0;
  overflow: visible;
`

const NavScroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 0 8px 0 0;

  &::-webkit-scrollbar {
    width: 0;
  }

  @media (max-height: 899px) {
    overflow-y: auto;
  }
`

const Bottom = styled.div`
  flex-shrink: 0;
  padding: 0 10px;
  margin-top: auto;
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
    <NavScroll className="melega-sidebar-nav">{navigation}</NavScroll>
    {footer && <Bottom>{footer}</Bottom>}
  </Aside>
)

export default MelegaSidebar
