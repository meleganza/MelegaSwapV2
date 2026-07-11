import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import { colors, MelegaFooter } from 'design-system/melega'

const Root = styled.div`
  min-height: 60vh;
  background: #050505;
  color: ${colors.textPrimary};
  padding: 48px 24px 64px;
`

const Inner = styled.div`
  max-width: 720px;
  margin: 0 auto;
`

const Title = styled.h1`
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 800;
`

const Sub = styled.p`
  margin: 0 0 24px;
  color: ${colors.textMuted};
  line-height: 1.5;
`

const Card = styled.div`
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 12px;
  background: rgba(255, 255, 255, 0.02);
`

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-size: 14px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &:last-child {
    border-bottom: none;
  }
`

const Label = styled.span`
  color: ${colors.textMuted};
`

const Value = styled.span`
  font-weight: 600;
  text-align: right;
`

const StatusPage: React.FC = () => (
  <Root data-melega-status-page>
    <PageMeta title="System Status" />
    <Inner>
      <Title>Melega DEX Status</Title>
      <Sub>Public operational status for Melega DEX production surfaces. Updated from on-chain registry and durable indexer health.</Sub>
      <Card>
        <Row>
          <Label>Production domain</Label>
          <Value>www.melega.finance</Value>
        </Row>
        <Row>
          <Label>Trade &amp; swap</Label>
          <Value>Operational</Value>
        </Row>
        <Row>
          <Label>On-chain registry</Label>
          <Value>Factory + MasterChef enumeration</Value>
        </Row>
        <Row>
          <Label>Event indexer</Label>
          <Value>Tier-1 MARCO/WBNB + Tier-2 liquid pairs</Value>
        </Row>
        <Row>
          <Label>DEX Intelligence</Label>
          <Value>Coming Soon</Value>
        </Row>
      </Card>
      <MelegaFooter
        left={<span style={{ fontSize: 12, color: colors.textMuted }}>© 2026 Melega DEX</span>}
        center={<span style={{ color: colors.gold, fontWeight: 800 }}>Melega DEX</span>}
        right={
          <a href="https://docs.melega.finance" target="_blank" rel="noreferrer" style={{ color: colors.textMuted }}>
            Docs
          </a>
        }
      />
    </Inner>
  </Root>
)

export default StatusPage
