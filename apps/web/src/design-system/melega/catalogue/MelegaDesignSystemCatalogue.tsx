import React from 'react'
import styled from 'styled-components'
import { colors, typography, spacing } from '../tokens'
import {
  MelegaButton,
  MelegaCard,
  MelegaPanel,
  MelegaBadge,
  MelegaStatusChip,
  MelegaSidebarItem,
  MelegaSidebarSection,
  MelegaHeader,
  MelegaSearchBar,
  MelegaTokenSelector,
  MelegaInput,
  MelegaStatCard,
  MelegaFeedRow,
  MelegaTimelineRow,
  MelegaTicker,
  MelegaCtaCard,
  MelegaFooter,
  MelegaBottomNavigation,
  MelegaSectionTitle,
  MelegaEmptyState,
  MelegaLoadingSkeleton,
} from '../components'

const Page = styled.div`
  min-height: 100vh;
  background: ${colors.canvas};
  color: ${colors.textPrimary};
  font-family: ${typography.fontFamily.body};
  padding: ${spacing[6]};
`

const Grid = styled.div`
  display: grid;
  gap: ${spacing[6]};
  max-width: 1200px;
  margin: 0 auto;
`

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${spacing[3]};
`

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${spacing[3]};
  align-items: center;
`

const Label = styled.h3`
  margin: 0;
  font-size: ${typography.fontSize.sm};
  font-weight: ${typography.fontWeight.bold};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${colors.textMuted};
`

const NavIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M7 10l3-3 3 3M17 14l-3 3-3-3" />
  </svg>
)

/** Static catalogue for documentation screenshots — not wired to any route. */
export const MelegaDesignSystemCatalogue: React.FC = () => (
  <Page data-melega-design-system-catalogue>
    <Grid>
      <MelegaSectionTitle title="Melega DEX Design System" subtitle="DS-001 component catalogue" />

      <Section>
        <Label>Buttons</Label>
        <Row>
          <MelegaButton>Primary</MelegaButton>
          <MelegaButton variant="secondary">Secondary</MelegaButton>
          <MelegaButton variant="ghost">Ghost</MelegaButton>
          <MelegaButton variant="danger">Danger</MelegaButton>
          <MelegaButton variant="disabled">Disabled</MelegaButton>
        </Row>
      </Section>

      <Section>
        <Label>Cards &amp; Panel</Label>
        <Row>
          <MelegaCard size="sm">Small card</MelegaCard>
          <MelegaCard size="md">Medium card</MelegaCard>
          <MelegaCard size="lg">Large card</MelegaCard>
        </Row>
        <MelegaPanel>Panel surface</MelegaPanel>
      </Section>

      <Section>
        <Label>Badges &amp; Chips</Label>
        <Row>
          <MelegaBadge variant="ready" dot>
            Ready
          </MelegaBadge>
          <MelegaBadge variant="live" dot>
            Live
          </MelegaBadge>
          <MelegaBadge variant="waiting">Waiting</MelegaBadge>
          <MelegaBadge variant="error">Error</MelegaBadge>
          <MelegaBadge variant="legacy">Legacy</MelegaBadge>
          <MelegaStatusChip variant="gold">Status</MelegaStatusChip>
        </Row>
      </Section>

      <Section>
        <Label>Navigation</Label>
        <MelegaSidebarSection label="TRADE">
          <MelegaSidebarItem label="Swap" active icon={<NavIcon />} />
          <MelegaSidebarItem label="Liquidity" icon={<NavIcon />} />
        </MelegaSidebarSection>
        <MelegaHeader
          left={<span style={{ fontWeight: 700 }}>Melega DEX</span>}
          center={<MelegaSearchBar />}
          right={<MelegaButton>Connect Wallet</MelegaButton>}
        />
      </Section>

      <Section>
        <Label>Inputs</Label>
        <Row style={{ maxWidth: 360 }}>
          <MelegaInput label="From" placeholder="0.0" style={{ width: '100%' }} />
          <MelegaTokenSelector symbol="BNB" />
        </Row>
      </Section>

      <Section>
        <Label>Data display</Label>
        <Row>
          <MelegaStatCard label="Top Pair" value="MARCO / BNB" meta="APR 35.8%" metaPositive />
          <MelegaFeedRow icon="↔" title="Swap" subtitle="BNB → MARCO" trailing="2m" />
        </Row>
        <MelegaTimelineRow icon="+" event="Liquidity Added" context="MARCO / BNB" time="5m" />
        <MelegaTicker
          items={[
            { id: '1', primary: 'MARCO / BNB', accent: '+12.4%' },
            { id: '2', primary: 'New pool', secondary: 'MARCO Staking' },
          ]}
        />
      </Section>

      <Section>
        <Label>CTA &amp; States</Label>
        <MelegaCtaCard
          title="List your project on Melega DEX"
          description="Add token details, upload logo, add liquidity."
          primaryAction={{ label: 'Start listing' }}
          secondaryAction={{ label: 'Reward MARCO holders' }}
        />
        <MelegaEmptyState
          title="No recent indexed activity yet."
          description="Swaps and listings will appear here when indexed."
        />
        <MelegaLoadingSkeleton lines={3} />
      </Section>

      <MelegaFooter left="© Melega DEX" right="Built for humans." />
    </Grid>
  </Page>
)

export default MelegaDesignSystemCatalogue
