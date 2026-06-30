import React from 'react'
import styled from 'styled-components'
import Head from 'next/head'
import { melegaOperational as tokens } from 'ui/tokens'

const Root = styled.div`
  min-height: 100vh;
  background: ${tokens.bg};
  color: ${tokens.text};
  font-family: ${tokens.fontBody};
  padding: 40px 24px 80px;
`

const Shell = styled.div`
  max-width: ${tokens.contentMaxWidth};
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${tokens.sectionGap};
`

export const EconomicPageShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Head>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Orbitron:wght@500;600;700&display=swap"
        rel="stylesheet"
      />
    </Head>
    <Root>
      <Shell>{children}</Shell>
    </Root>
  </>
)

export default EconomicPageShell
