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
  PortalFooter,
  PortalHero,
  PortalInner,
  PortalPage,
  StatusPill,
  StatusRow,
} from 'views/DeveloperPortal/PortalShell'

type WidgetKind = 'swap' | 'bridge' | 'liquidity' | 'farm' | 'pool' | 'badge'

const widgetOptions: Array<{ id: WidgetKind; icon: string; label: string }> = [
  { id: 'swap', icon: '⇄', label: 'Smart Swap' },
  { id: 'bridge', icon: '⌒', label: 'MARCO Bridge' },
  { id: 'liquidity', icon: '◉', label: 'Liquidity' },
  { id: 'farm', icon: '♧', label: 'Farm' },
  { id: 'pool', icon: '▱', label: 'Pool' },
  { id: 'badge', icon: 'M', label: 'Melega DEX Badge' },
]

const Workbench = styled.section`
  margin-top: 16px;
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr) minmax(340px, 440px);
  gap: 14px;
  align-items: stretch;

  @media (max-width: 1120px) {
    grid-template-columns: 220px minmax(0, 1fr);
  }
  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`

const Surface = styled.section`
  min-width: 0;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.11);
  border-radius: 14px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.025), transparent 42%), #101212;
`

const WidgetNav = styled(Surface)`
  display: grid;
  align-content: start;
  gap: 8px;
`

const SectionLabel = styled.div`
  margin-bottom: 7px;
  color: #f4c430;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`

const WidgetButton = styled.button<{ $active?: boolean }>`
  min-height: 48px;
  padding: 0 13px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(244, 196, 48, 0.75)' : 'rgba(255,255,255,.08)')};
  border-radius: 9px;
  background: ${({ $active }) =>
    $active ? 'linear-gradient(100deg, rgba(244,196,48,.15), rgba(244,196,48,.04))' : '#111313'};
  color: #f3f3f3;
  display: flex;
  align-items: center;
  gap: 11px;
  text-align: left;
  cursor: pointer;
  font-weight: 700;

  span {
    width: 23px;
    color: #f4c430;
    font-size: 18px;
    text-align: center;
  }
`

const Title = styled.h2`
  margin: 0 0 16px;
  font-size: 21px;
`

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`

const Field = styled.label`
  display: grid;
  gap: 7px;
  color: #a8a8a8;
  font-size: 12px;

  input,
  select {
    width: 100%;
    height: 44px;
    padding: 0 12px;
    box-sizing: border-box;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 9px;
    background: #151719;
    color: #fff;
  }
`

const CodeHead = styled.div`
  margin-top: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

const Copy = styled.button`
  min-height: 36px;
  padding: 0 13px;
  border: 1px solid rgba(244, 196, 48, 0.48);
  border-radius: 8px;
  background: rgba(244, 196, 48, 0.08);
  color: #f4c430;
  cursor: pointer;
  font-weight: 750;
`

const PreviewSurface = styled(Surface)`
  @media (max-width: 1120px) {
    grid-column: 1 / -1;
  }
`

const PreviewHead = styled.div`
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  strong {
    font-size: 18px;
  }
  span {
    color: #00e676;
    font-size: 11px;
    font-weight: 800;
  }
`

const Preview = styled.iframe`
  width: 100%;
  height: 600px;
  display: block;
  border: 1px solid rgba(244, 196, 48, 0.3);
  border-radius: 12px;
  background: #070808;

  @media (max-width: 760px) {
    height: 650px;
  }
`

const BadgePreview = styled.a`
  min-height: 300px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(244, 196, 48, 0.3);
  border-radius: 12px;
  background: #070808;
  color: #fff;
  text-decoration: none;
  font-size: 24px;
  font-weight: 850;
  img {
    width: 58px;
    height: 58px;
    margin-right: 12px;
    vertical-align: middle;
    border-radius: 50%;
  }
  span {
    color: #f4c430;
  }
`

const Steps = styled.section`
  margin-top: 14px;
  padding: 18px 22px;
  border: 1px solid rgba(244, 196, 48, 0.28);
  border-radius: 14px;
  background: #101212;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`

const Step = styled.div`
  display: grid;
  grid-template-columns: 36px 1fr;
  gap: 10px;
  align-items: center;
  i {
    width: 34px;
    height: 34px;
    border: 1px solid #f4c430;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: #f4c430;
    font-style: normal;
  }
  strong {
    display: block;
  }
  small {
    color: #999;
  }
`

const Security = styled.section`
  margin-top: 14px;
  padding: 17px 22px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  background: #101212;
  display: flex;
  flex-wrap: wrap;
  gap: 18px 34px;
  color: #aaa;
  font-size: 12px;
  strong {
    color: #f4c430;
  }
`

function widgetUrl(kind: WidgetKind, token: string, target: string): string {
  if (kind === 'swap') return `/embed/swap?inputCurrency=BNB&outputCurrency=${encodeURIComponent(token)}`
  if (kind === 'bridge') return '/embed/bridge'
  if (kind === 'badge') return ''
  return `/embed/market?kind=${kind}&target=${encodeURIComponent(target)}`
}

const DevsPage: React.FC = () => {
  const [kind, setKind] = useState<WidgetKind>('swap')
  const [token, setToken] = useState(MARCO_BSC_ADDRESS)
  const [target, setTarget] = useState('')
  const [copied, setCopied] = useState(false)
  const url = useMemo(() => widgetUrl(kind, token.trim() || MARCO_BSC_ADDRESS, target.trim()), [kind, token, target])
  const absolute = `https://www.melega.finance${url}`
  const code =
    kind === 'badge'
      ? `<a href="https://www.melega.finance" rel="noopener"><img src="https://www.melega.finance/images/melega.png" alt="Melega DEX" width="48" height="48" /></a>`
      : `<iframe title="Melega DEX ${kind}" src="${absolute}" width="100%" height="600" loading="lazy" scrolling="no" allow="clipboard-write"></iframe>`

  return (
    <>
      <PageMeta title="Devs" />
      <PortalPage data-testid="melega-devs-page">
        <PortalInner>
          <PortalHero>
            <HeroCopy>
              <Eyebrow>⌘ Melega DEX for builders</Eyebrow>
              <HeroTitle>Build on Melega DEX.</HeroTitle>
              <HeroLead>Embed verified liquidity. Configure once. Ship anywhere.</HeroLead>
            </HeroCopy>
            <StatusRow>
              <StatusPill $ok>● Widget SDK · LIVE</StatusPill>
              <StatusPill $ok>● No custody</StatusPill>
            </StatusRow>
          </PortalHero>

          <Workbench>
            <WidgetNav aria-label="Official widgets">
              <SectionLabel>Official widgets</SectionLabel>
              {widgetOptions.map((item) => (
                <WidgetButton key={item.id} type="button" $active={kind === item.id} onClick={() => setKind(item.id)}>
                  <span>{item.icon}</span>
                  {item.label}
                </WidgetButton>
              ))}
            </WidgetNav>

            <Surface>
              <Title>Configure {widgetOptions.find((item) => item.id === kind)?.label}</Title>
              <FormGrid>
                {kind === 'swap' ? (
                  <Field>
                    Default token
                    <input value={token} onChange={(event) => setToken(event.target.value)} spellCheck={false} />
                  </Field>
                ) : null}
                {kind === 'farm' || kind === 'pool' || kind === 'liquidity' ? (
                  <Field>
                    Pair, PID or contract
                    <input
                      value={target}
                      onChange={(event) => setTarget(event.target.value)}
                      placeholder="Blank selects the first live market"
                    />
                  </Field>
                ) : null}
                <Field>
                  Network
                  <select defaultValue="bsc">
                    <option value="bsc">BNB Smart Chain</option>
                  </select>
                </Field>
                <Field>
                  Theme
                  <select defaultValue="dark">
                    <option value="dark">Dark</option>
                  </select>
                </Field>
              </FormGrid>
              <CodeHead>
                <SectionLabel style={{ margin: 0 }}>HTML embed</SectionLabel>
                <Copy
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(code)
                    setCopied(true)
                  }}
                >
                  {copied ? 'Copied' : 'Copy embed'}
                </Copy>
              </CodeHead>
              <Code>{code}</Code>
            </Surface>

            <PreviewSurface>
              <PreviewHead>
                <strong>Live preview</strong>
                <span>✓ OFFICIAL WIDGET · LIVE</span>
              </PreviewHead>
              {kind === 'badge' ? (
                <BadgePreview href="https://www.melega.finance" target="_blank" rel="noopener noreferrer">
                  <div>
                    <img src="/images/melega.png" alt="" />
                    Melega<span>DEX</span>
                  </div>
                </BadgePreview>
              ) : (
                <Preview title={`${kind} live preview`} src={url} loading="lazy" scrolling="no" />
              )}
            </PreviewSurface>
          </Workbench>

          <Steps>
            <Step>
              <i>1</i>
              <div>
                <strong>Configure</strong>
                <small>Choose widget, market and network.</small>
              </div>
            </Step>
            <Step>
              <i>2</i>
              <div>
                <strong>Copy embed</strong>
                <small>Add the snippet to your site or dApp.</small>
              </div>
            </Step>
            <Step>
              <i>3</i>
              <div>
                <strong>Go live</strong>
                <small>Users retain control of every wallet action.</small>
              </div>
            </Step>
          </Steps>
          <Security>
            <strong>SECURITY &amp; PROVENANCE</strong>
            <span>✓ Versioned configuration</span>
            <span>✓ Non-custodial</span>
            <span>✓ Live market state</span>
            <span>✓ Canonical Melega DEX actions</span>
          </Security>
          <PortalFooter />
        </PortalInner>
      </PortalPage>
    </>
  )
}

DevsPage.chains = CHAIN_IDS

export default DevsPage
