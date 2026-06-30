import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { ht } from './homeTradeTokens'

const Footer = styled.footer`
  display: none;
  margin-top: 28px;
  border-top: 1px solid ${ht.borderSoft};
  min-height: 60px;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  font-family: ${ht.fontBody};
  font-size: 12px;
  color: ${ht.textMuted};

  @media (min-width: 1024px) {
    display: flex;
  }
`

const Links = styled.div`
  display: flex;
  gap: 20px;
`

const FooterLink = styled(Link)`
  color: ${ht.textMuted};
  text-decoration: none;

  &:hover {
    color: ${ht.gold};
  }
`

const Center = styled.div`
  color: ${ht.gold};
  font-weight: 700;
  font-size: 14px;
`

export const HomeTradeFooter: React.FC = () => (
  <Footer>
    <span>© 2026 Melega DEX. All rights reserved.</span>
    <Center>Melega DEX</Center>
    <Links>
      <FooterLink href="https://docs.melega.finance" target="_blank" rel="noreferrer">
        Docs
      </FooterLink>
      <FooterLink href="/runtime/labs">Status</FooterLink>
      <FooterLink href="/orchestrator">Operator Mode</FooterLink>
    </Links>
  </Footer>
)

export default HomeTradeFooter
