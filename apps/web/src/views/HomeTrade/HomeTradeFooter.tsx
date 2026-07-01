import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { MelegaFooter, colors } from 'design-system/melega'

const FooterLink = styled(Link)`
  color: ${colors.textMuted};
  text-decoration: none;

  &:hover {
    color: ${colors.gold};
  }
`

const Brand = styled.span`
  color: ${colors.gold};
  font-weight: 800;
  font-size: 13px;
`

const DesktopFooter = styled.div`
  display: none;
  margin-top: 18px;
  height: 54px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);

  @media (min-width: 768px) {
    display: block;
  }
`

const RightLinks = styled.div`
  display: flex;
  gap: 24px;
`

export const HomeTradeFooter: React.FC = () => (
  <DesktopFooter>
    <MelegaFooter
      left={<span style={{ fontSize: 12, color: colors.textMuted }}>© 2026 Melega DEX. All rights reserved.</span>}
      center={<Brand>Melega DEX</Brand>}
      right={
        <RightLinks>
          <FooterLink href="https://docs.melega.finance" target="_blank" rel="noreferrer">
            Docs
          </FooterLink>
          <FooterLink href="/runtime/labs">Status</FooterLink>
          <FooterLink href="/orchestrator">Operator Mode</FooterLink>
        </RightLinks>
      }
    />
  </DesktopFooter>
)

export default HomeTradeFooter
