import React from 'react'
import styled from 'styled-components'
import { colors } from '../../tokens'

const ASIDE_WIDTH = '230px'
const SIDEBAR_BG = colors.background

const Aside = styled.aside`
  display: none;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: ${ASIDE_WIDTH};
  background: ${SIDEBAR_BG};
  border-right: 1px solid rgba(255, 255, 255, 0.07);
  padding: 24px 14px 14px;
  z-index: 100;
  box-sizing: border-box;
  flex-direction: column;

  @media (min-width: 768px) {
    display: flex;
    overflow: hidden;
  }

  @media (min-height: 820px) and (max-height: 920px) {
    .melega-sidebar-nav {
      overflow-y: auto;
    }
  }
`

const BrandRow = styled.div`
  height: 44px;
  margin-bottom: 22px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
`

const NavScroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow: hidden;

  &::-webkit-scrollbar {
    width: 0;
  }
`

const Bottom = styled.div`
  flex-shrink: 0;
  margin-top: 12px;
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
