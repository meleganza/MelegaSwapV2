import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { CHAIN_IDS } from 'utils/wagmi'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import {
  Code,
  Eyebrow,
  HeroCopy,
  HeroLead,
  HeroTitle,
  Panel,
  PanelBody,
  PanelTitle,
  PortalFooter,
  PortalHero,
  PortalInner,
  PortalPage,
  Stack,
  StatusPill,
  StatusRow,
} from 'views/DeveloperPortal/PortalShell'

const BuilderGrid = styled.div`
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`

const Field = styled.label`
  margin-top: 14px;
  display: grid;
  gap: 6px;
  color: #aaa;
  font-size: 12px;

  input, select {
    height: 44px;
    padding: 0 13px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 9px;
    background: #151719;
    color: #f4f4f4;
  }
`

const Preview = styled.iframe`
  width: 100%;
  height: 520px;
  margin-top: 14px;
  border: 1px solid rgba(221, 185, 47, 0.25);
  border-radius: 12px;
  background: #070808;
`

const WidgetCard: React.FC<{ title: string; body: string; code: string; preview?: string }> = ({
  title,
  body,
  code,
  preview,
}) => (
  <Panel>
    <PanelTitle>{title}</PanelTitle>
    <PanelBody>{body}</PanelBody>
    <Code>{code}</Code>
    {preview ? <Preview title={`${title} preview`} src={preview} loading="lazy" /> : null}
  </Panel>
)

const DevsPage: React.FC = () => {
  const [token, setToken] = useState(MARCO_BSC_ADDRESS)
  const [marketKind, setMarketKind] = useState('farm')
  const [marketTarget, setMarketTarget] = useState('MARCO/WBNB')

  const swapUrl = useMemo(
    () => `/embed/swap?inputCurrency=BNB&outputCurrency=${encodeURIComponent(token.trim() || MARCO_BSC_ADDRESS)}`,
    [token],
  )
  const marketUrl = useMemo(
    () => `/embed/market?kind=${marketKind}&target=${encodeURIComponent(marketTarget.trim())}`,
    [marketKind, marketTarget],
  )

  return (
    <>
      <PageMeta title="Devs" />
      <PortalPage data-testid="melega-devs-page">
        <PortalInner>
          <PortalHero>
            <HeroCopy>
              <Eyebrow>⌘ Melega DEX for developers</Eyebrow>
              <HeroTitle>Build with liquidity.</HeroTitle>
              <HeroLead>
                Embed executable Melega DEX surfaces with a server-owned configuration and a branded, responsive
                integration boundary.
              </HeroLead>
            </HeroCopy>
            <StatusRow>
              <StatusPill $ok>Official embeds</StatusPill>
              <StatusPill>Responsive iframe</StatusPill>
            </StatusRow>
          </PortalHero>

          <BuilderGrid>
            <Panel>
              <PanelTitle>Smart Swap widget builder</PanelTitle>
              <PanelBody>Set the token that visitors should be able to buy first. The wallet still confirms every trade.</PanelBody>
              <Field>
                Output token contract
                <input value={token} onChange={(event) => setToken(event.target.value)} spellCheck={false} />
              </Field>
              <Code>{`<iframe
  title="Melega DEX Smart Swap"
  src="https://www.melega.finance${swapUrl}"
  width="100%" height="620" loading="lazy"
  allow="clipboard-write"
></iframe>`}</Code>
              <Preview title="Smart Swap widget preview" src={swapUrl} />
            </Panel>

            <WidgetCard
              title="MARCO Bridge widget"
              body="Embed the same tracked MARCO Bridge panel used by Melega DEX. Availability remains controlled by the live bridge capability."
              code={`<iframe title="MARCO Bridge" src="https://www.melega.finance/embed/bridge" width="100%" height="680" loading="lazy"></iframe>`}
              preview="/embed/bridge"
            />

            <Panel>
              <PanelTitle>Farm, Pool &amp; Liquidity widgets</PanelTitle>
              <PanelBody>
                Select the surface and provide its live PID, contract, LP address or pair identifier. The widget links
                to the canonical action surface rather than inventing unavailable yield data.
              </PanelBody>
              <Field>
                Widget type
                <select value={marketKind} onChange={(event) => setMarketKind(event.target.value)}>
                  <option value="farm">Farm</option>
                  <option value="pool">Pool</option>
                  <option value="liquidity">Liquidity</option>
                </select>
              </Field>
              <Field>
                Live target
                <input value={marketTarget} onChange={(event) => setMarketTarget(event.target.value)} />
              </Field>
              <Code>{`<iframe title="Melega ${marketKind}" src="https://www.melega.finance${marketUrl}" width="100%" height="320" loading="lazy"></iframe>`}</Code>
              <Preview title="Yield widget preview" src={marketUrl} style={{ height: 330 }} />
            </Panel>

            <WidgetCard
              title="Melega DEX badge"
              body="Use the official Melega asset hosted by the DEX. Keep the badge linked to the canonical exchange."
              code={`<a href="https://www.melega.finance" rel="noopener">
  <img src="https://www.melega.finance/images/melega.png"
       alt="Trade on Melega DEX" width="168" height="48" />
</a>`}
            />
          </BuilderGrid>
          <PortalFooter />
        </PortalInner>
      </PortalPage>
    </>
  )
}

DevsPage.chains = CHAIN_IDS

export default DevsPage
