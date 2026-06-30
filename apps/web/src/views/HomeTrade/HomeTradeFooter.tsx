import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { MelegaFooter, colors, typography } from 'design-system/melega'

const FooterLink = styled(Link)`
  color: ${colors.textMuted};
  text-decoration: none;

  &:hover {
    color: ${colors.gold};
  }
`

const Brand = styled.span`
  color: ${colors.gold};
  font-weight: ${typography.fontWeight.bold};
  font-size: ${typography.fontSize.base};
`

const DesktopFooter = styled.div`
  display: none;

  @media (min-width: 768px) {
    display: block;
    margin-top: 28px;
  }
`

export const HomeTradeFooter: React.FC = () => (
  <DesktopFooter>
    <MelegaFooter
      left={<span>© 2026 Melega DEX. All rights reserved.</span>}
      center={<Brand>Melega DEX</Brand>}
      right={
        <>
          <FooterLink href="https://docs.melega.finance" target="_blank" rel="noreferrer">
            Docs
          </FooterLink>
          <FooterLink href="/runtime/labs">Status</FooterLink>
          <FooterLink href="/orchestrator">Operator Mode</FooterLink>
        </>
      }
    />
  </DesktopFooter>
)

export default HomeTradeFooter
