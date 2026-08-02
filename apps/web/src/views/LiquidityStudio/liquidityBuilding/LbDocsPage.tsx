/**
 * Shared shell for /docs/liquidity-builder/* contextual pages.
 */
import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { CHAIN_IDS } from 'utils/wagmi'
import {
  uxRebuildColors,
  uxRebuildFont,
  uxRebuildLayout,
  uxRebuildRadius,
} from 'design-system/melega/tokens/uxRebuild'

const Root = styled.main`
  min-height: 70vh;
  color: ${uxRebuildColors.text};
  font-family: ${uxRebuildFont};
  background: ${uxRebuildColors.pageBg};
  padding: 40px 24px 64px;
`

const Inner = styled.div`
  width: 100%;
  max-width: ${uxRebuildLayout.contentMax};
  margin: 0 auto;
`

const Crumb = styled.nav`
  font-size: 13px;
  color: ${uxRebuildColors.muted};
  margin-bottom: 16px;

  a {
    color: ${uxRebuildColors.gold};
    text-decoration: none;
  }
`

const H1 = styled.h1`
  margin: 0 0 10px;
  font-size: 28px;
  font-weight: 800;
`

const Lead = styled.p`
  margin: 0 0 20px;
  max-width: 720px;
  line-height: 1.55;
  color: ${uxRebuildColors.bodySoft};
`

const Card = styled.section`
  padding: 18px;
  border-radius: ${uxRebuildRadius.card};
  background: ${uxRebuildColors.card};
  border: 1px solid ${uxRebuildColors.border};
  margin-bottom: 12px;
`

const Body = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.55;
  color: ${uxRebuildColors.secondary};
`

const Related = styled.ul`
  margin: 16px 0 0;
  padding: 0 0 0 18px;
  color: ${uxRebuildColors.secondary};
  font-size: 13px;
  line-height: 1.6;
`

type Props = {
  title: string
  lead: string
  body: string
  path: string
}

export function LbDocsPage({ title, lead, body, path }: Props) {
  return (
    <Root data-melega-lb-docs data-path={path}>
      <PageMeta title={`${title} · Liquidity Builder Docs`} />
      <Inner>
        <Crumb>
          <Link href="/docs">Docs</Link>
          {' / '}
          <Link href="/liquidity">Liquidity Builder</Link>
          {' / '}
          {title}
        </Crumb>
        <H1>{title}</H1>
        <Lead>{lead}</Lead>
        <Card>
          <Body>{body}</Body>
        </Card>
        <Related>
          <li>
            <Link href="/docs/liquidity-builder/token-reserve">Token Reserve</Link>
          </li>
          <li>
            <Link href="/docs/liquidity-builder/strategies">Strategies</Link>
          </li>
          <li>
            <Link href="/docs/liquidity-builder/execution">Execution</Link>
          </li>
          <li>
            <Link href="/docs/liquidity-builder/fees">Fees</Link>
          </li>
        </Related>
      </Inner>
    </Root>
  )
}

LbDocsPage.chains = CHAIN_IDS
