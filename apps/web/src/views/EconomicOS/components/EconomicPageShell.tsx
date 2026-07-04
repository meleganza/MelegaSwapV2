import React from 'react'
import styled from 'styled-components'
import Head from 'next/head'
import { MelegaBrandLockup } from 'design-system/melega/components/BrandLockup/MelegaBrandLockup'

const Root = styled.div`
  min-height: 100vh;
  background: #050505;
  color: #f5f5f5;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  padding: 28px 24px 80px;
`

const Shell = styled.div`
  max-width: 1180px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const BrandRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`

const PageTag = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #8f8f8f;
`

export const EconomicPageShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Head>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Orbitron:wght@500;600;700&display=swap"
        rel="stylesheet"
      />
    </Head>
    <Root data-economic-page-shell>
      <Shell>
        <BrandRow>
          <MelegaBrandLockup size="desktop" iconOnly />
          <PageTag>Portfolio · My Economy</PageTag>
        </BrandRow>
        {children}
      </Shell>
    </Root>
  </>
)

export default EconomicPageShell
