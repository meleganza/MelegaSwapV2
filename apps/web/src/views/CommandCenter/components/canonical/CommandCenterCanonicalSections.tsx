import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { ChainId } from '@pancakeswap/sdk'
import { MelegaSearchBar } from 'design-system/melega'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useCommandRuntime } from '../../commandCenterRuntime/CommandRuntimeContext'
import {
  CC_FONT_BODY,
  CC_FONT_DISPLAY,
  commandCenterColors,
  commandCenterLayout,
  commandCenterType,
} from '../../commandCenterTokens'
import {
  ActionPill,
  EmptyBlock,
  EmptyDescription,
  EmptyIcon,
  EmptyTitle,
  InfraStatusPill,
  MelegaEmblem,
  PriorityBadge,
  SectionHeading,
  SpecCard,
  SpecDesc,
  SpecGhostBtn,
  SpecLabel,
  SpecPrimaryBtn,
  SpecSecondaryBtn,
  SpecTreasuryGhostBtn,
  StatusBadge,
} from './commandCenterSpecPrimitives'

const CHAIN_LABELS: Record<number, string> = {
  [ChainId.BSC]: 'BNB Chain',
  [ChainId.ETHEREUM]: 'Ethereum',
  [ChainId.POLYGON]: 'Polygon',
  [ChainId.ARBITRUM]: 'Arbitrum',
  [ChainId.BASE]: 'Base',
}

function greetingForHour(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning, Marco.'
  if (h < 18) return 'Good afternoon, Marco.'
  return 'Good evening, Marco.'
}

function notificationGroup(time: string): 'Today' | 'Yesterday' | 'Earlier' {
  if (time.includes('s ago') || time.includes('m ago') || time.includes('h ago')) return 'Today'
  if (time.includes('1d ago')) return 'Yesterday'
  return 'Earlier'
}

function parseNotificationTitle(title: string) {
  const parts = title.split(' — ').map((s) => s.trim())
  if (parts.length >= 2) return { title: parts[0], subtitle: parts.slice(1).join(' — ') }
  return { title, subtitle: '' }
}

function parseActivityRow(label: string) {
  const parts = label.split('—').map((s) => s.trim())
  const action = parts[0] || label
  let module = 'Runtime'
  const lower = label.toLowerCase()
  if (lower.includes('swap') || lower.includes('trade')) module = 'Trade'
  else if (lower.includes('pool') || lower.includes('claim')) module = 'Pools'
  else if (lower.includes('farm') || lower.includes('harvest')) module = 'Farms'
  else if (lower.includes('liquidity')) module = 'Liquidity'
  else if (lower.includes('build') || lower.includes('import')) module = 'Build'
  return { module, action }
}

function settlementDisplay(label: string): { primary: string; detail: string | null } {
  if (label === 'No settlement data') {
    return {
      primary: 'No settlement available.',
      detail: 'Trade runtime is waiting for the first Treasury confirmation.',
    }
  }
  if (label === 'Settled') {
    return { primary: 'Settlement completed successfully.', detail: null }
  }
  if (label === 'Settlement Pending' || label === 'Treasury Unavailable') {
    return {
      primary: 'No settlement available.',
      detail: 'Trade runtime is waiting for the first Treasury confirmation.',
    }
  }
  if (label === 'Settlement Rejected') {
    return { primary: 'Settlement rejected.', detail: null }
  }
  if (label === 'Duplicate Settlement') {
    return { primary: 'Duplicate settlement.', detail: null }
  }
  return { primary: `${label}.`, detail: null }
}

const REC_ICONS: Record<string, string> = {
  rebalance: '↔',
  claim: '💰',
  pool: '🏊',
  radar: '📡',
  audit: '🛡',
}

/* ── SECTION 1: HEADER ── */

const HeaderCard = styled.header`
  min-height: ${commandCenterLayout.headerHeight};
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  @media (max-width: ${commandCenterLayout.mobileBreakpoint}) {
    min-height: ${commandCenterLayout.headerHeightMobile};
  }
`

const HeaderRow1 = styled.div`
  min-width: 0;
`

const PageTitle = styled.h1`
  margin: 0;
  font-family: ${CC_FONT_DISPLAY};
  font-size: ${commandCenterType.pageTitle};
  font-weight: 700;
  letter-spacing: ${commandCenterType.pageTitleLetterSpacing};
  line-height: ${commandCenterType.pageTitleLineHeight};
  color: ${commandCenterColors.white};
`

const PageSubtitle = styled.p`
  margin: 2px 0 0;
  font-family: ${CC_FONT_BODY};
  font-size: ${commandCenterType.subtitle};
  font-weight: 400;
  line-height: ${commandCenterType.subtitleLineHeight};
  color: ${commandCenterColors.subtitle};
  max-width: 560px;
`

const HeaderRow2 = styled.div`
  margin-top: ${commandCenterLayout.headerRow2MarginTop};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${commandCenterLayout.headerControlsGap};

  @media (max-width: ${commandCenterLayout.mobileBreakpoint}) {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
`

const SearchWrap = styled.div`
  width: ${commandCenterLayout.headerSearchWidth};
  min-width: 0;
  flex-shrink: 0;

  & > * {
    height: 44px;
    border-radius: 12px;
  }

  @media (max-width: ${commandCenterLayout.mobileBreakpoint}) {
    width: 100%;
  }
`

const HeaderControlsRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${commandCenterLayout.headerControlsGap};
  flex-shrink: 0;

  @media (max-width: ${commandCenterLayout.mobileBreakpoint}) {
    flex-direction: row;
    align-items: stretch;
    width: 100%;
    gap: ${commandCenterLayout.headerControlsGap};
  }
`

const WalletWrap = styled.div`
  flex-shrink: 0;
  width: ${commandCenterLayout.headerWalletWidth};

  & button {
    width: 100%;
    height: 44px !important;
    border-radius: 12px;
  }

  @media (max-width: ${commandCenterLayout.mobileBreakpoint}) {
    width: 55%;
    flex: 0 0 55%;
  }
`

const ChainChip = styled.span`
  width: ${commandCenterLayout.headerChainWidth};
  height: 44px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid ${commandCenterColors.cardBorder};
  background: ${commandCenterColors.cardBg};
  font-family: ${CC_FONT_BODY};
  font-size: 13px;
  font-weight: 600;
  color: ${commandCenterColors.white};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  box-sizing: border-box;
  flex-shrink: 0;

  @media (max-width: ${commandCenterLayout.mobileBreakpoint}) {
    width: 45%;
    flex: 0 0 45%;
    min-width: 0;
  }
`

export const CcSpecHeader: React.FC = () => {
  const { chainId } = useActiveChainId()
  const chainLabel = chainId ? CHAIN_LABELS[chainId] ?? `Chain ${chainId}` : 'No chain'

  return (
    <HeaderCard data-cc-spec-header>
      <HeaderRow1>
        <PageTitle>COMMAND CENTER</PageTitle>
        <PageSubtitle>
          Everything you own, build, earn and operate across the Melega ecosystem.
        </PageSubtitle>
      </HeaderRow1>
      <HeaderRow2>
        <SearchWrap>
          <MelegaSearchBar placeholder="Search…" />
        </SearchWrap>
        <HeaderControlsRight>
          <ChainChip data-cc-chain>{chainLabel}</ChainChip>
          <WalletWrap>
            <ConnectWalletButton scale="md" />
          </WalletWrap>
        </HeaderControlsRight>
      </HeaderRow2>
    </HeaderCard>
  )
}

/* ── SECTION 2: DAILY BRIEFING ── */

const BriefingCard = styled(SpecCard)`
  height: ${commandCenterLayout.briefingHeight};
  padding: ${commandCenterLayout.briefingPaddingTop} ${commandCenterLayout.briefingPaddingX}
    ${commandCenterLayout.briefingPaddingBottom};
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 20px;
  overflow: hidden;
  box-sizing: border-box;

  @media (max-width: ${commandCenterLayout.mobileBreakpoint}) {
    height: ${commandCenterLayout.briefingHeightMobile};
  }
`

const BriefingColumn = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`

const Greeting = styled.h2`
  margin: 0 0 18px;
  font-family: ${CC_FONT_DISPLAY};
  font-size: ${commandCenterType.greeting};
  font-weight: 700;
  line-height: 1.1;
  color: ${commandCenterColors.white};
  max-width: 440px;

  @media (max-width: ${commandCenterLayout.mobileBreakpoint}) {
    font-size: ${commandCenterType.greetingMobile};
  }
`

const BulletList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-start;
  width: 100%;
`

const Bullet = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-family: ${CC_FONT_BODY};
  font-size: 15px;
  font-weight: 400;
  line-height: 24px;
  color: ${commandCenterColors.body};
  min-height: 24px;

  &::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${commandCenterColors.gold};
    margin-top: 9px;
    flex-shrink: 0;
  }
`

const BriefingSpacer = styled.div`
  flex: 1;
  min-height: 8px;
  width: 100%;
`

export const CcSpecDailyBriefing: React.FC = () => {
  const { briefing } = useCommandRuntime()
  const bullets = briefing.bullets.slice(0, 3)

  return (
    <BriefingCard data-cc-spec-briefing>
      <BriefingColumn>
        <Greeting>{greetingForHour()}</Greeting>
        <BulletList>
          {bullets.map((b, i) => (
            <Bullet key={`bullet-${i}`}>{b}</Bullet>
          ))}
        </BulletList>
        <BriefingSpacer aria-hidden />
        <ActionPill>Estimated actions today · {briefing.estimatedActions}</ActionPill>
      </BriefingColumn>
      <MelegaEmblem aria-hidden />
    </BriefingCard>
  )
}

/* ── SECTION 3: PORTFOLIO OVERVIEW ── */

const PortfolioRow = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: ${commandCenterLayout.cardGap};

  @media (max-width: ${commandCenterLayout.stackBreakpoint}) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: ${commandCenterLayout.mobileBreakpoint}) {
    grid-template-columns: 1fr;
  }
`

const PortfolioCard = styled(SpecCard)`
  height: ${commandCenterLayout.portfolioCardHeight};
  padding: ${commandCenterLayout.portfolioCardPadding};
  padding-bottom: ${commandCenterLayout.portfolioCardPaddingBottom};
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
`

const PortfolioBody = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const PortfolioLabel = styled.span`
  font-family: ${CC_FONT_BODY};
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: ${commandCenterColors.label};
  margin-bottom: 8px;
`

const PortfolioValue = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: ${commandCenterType.metric};
  font-weight: 700;
  line-height: 1.1;
  color: ${commandCenterColors.white};
`

const PortfolioValueDisconnected = styled(PortfolioValue)`
  font-size: ${commandCenterType.portfolioDisconnected};
`

const PortfolioDesc = styled.span`
  font-family: ${CC_FONT_BODY};
  font-size: 13px;
  font-weight: 400;
  line-height: 1.4;
  color: ${commandCenterColors.portfolioHint};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const PortfolioConnectWrap = styled.div`
  margin-top: auto;
  align-self: flex-start;
  min-height: 40px;
  display: flex;
  align-items: flex-end;

  & button {
    height: 40px !important;
    background: transparent !important;
    color: ${commandCenterColors.gold} !important;
    box-shadow: none !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    padding: 0 !important;
  }
`

export const CcSpecPortfolioOverview: React.FC = () => {
  const { assets, liquidity, pools, farms, account } = useCommandRuntime()

  const cards = [
    {
      id: 'assets',
      label: 'Assets',
      value: String(assets.length),
      delta: assets.length > 0 ? 'Connected' : 'No positions',
      positive: assets.length > 0,
    },
    {
      id: 'liquidity',
      label: 'Liquidity',
      value: String(liquidity.length),
      delta: liquidity.length > 0 ? 'Active positions' : 'No positions',
      positive: liquidity.length > 0,
    },
    {
      id: 'pools',
      label: 'Pools',
      value: String(pools.length),
      delta: pools.length > 0 ? 'Staked' : 'No positions',
      positive: pools.length > 0,
    },
    {
      id: 'farms',
      label: 'Farms',
      value: String(farms.length),
      delta: farms.length > 0 ? 'Staked' : 'No positions',
      positive: farms.length > 0,
    },
  ]

  return (
    <div data-cc-spec-portfolio>
      <SectionHeading>Portfolio Overview</SectionHeading>
      <PortfolioRow>
        {cards.map((c) => (
          <PortfolioCard key={c.id}>
            <PortfolioLabel>{c.label}</PortfolioLabel>
            <PortfolioBody>
              {!account ? (
                <>
                  <PortfolioValueDisconnected>No wallet connected</PortfolioValueDisconnected>
                  <PortfolioDesc>Connect your wallet to load balances.</PortfolioDesc>
                </>
              ) : (
                <>
                  <PortfolioValue>{c.value}</PortfolioValue>
                  <PortfolioDesc style={{ color: c.positive ? commandCenterColors.green : commandCenterColors.portfolioHint }}>
                    {c.delta}
                  </PortfolioDesc>
                </>
              )}
            </PortfolioBody>
            <PortfolioConnectWrap>
              {!account ? <ConnectWalletButton scale="sm">Connect Wallet</ConnectWalletButton> : null}
            </PortfolioConnectWrap>
          </PortfolioCard>
        ))}
      </PortfolioRow>
    </div>
  )
}

/* ── SECTION 4: TODAY'S PRIORITIES ── */

const PrioritiesGrid = styled.div`
  display: grid;
  grid-template-columns: ${commandCenterLayout.prioritiesLeft} ${commandCenterLayout.prioritiesRight};
  gap: ${commandCenterLayout.cardGap};

  @media (max-width: ${commandCenterLayout.stackBreakpoint}) {
    grid-template-columns: 1fr;
  }
`

const PriorityPanel = styled(SpecCard)`
  height: ${commandCenterLayout.prioritiesHeight};
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden;
  box-sizing: border-box;
`

const PanelSubLabel = styled.span`
  font-family: ${CC_FONT_BODY};
  font-size: ${commandCenterType.label};
  font-weight: 500;
  color: ${commandCenterColors.label};
  margin-bottom: 12px;
`

const ActionRow = styled.div`
  display: grid;
  grid-template-columns: 28px 1fr auto;
  gap: 14px;
  align-items: center;
  height: 56px;
  min-height: 56px;
  border-bottom: 1px solid ${commandCenterColors.cardBorder};

  &:last-child {
    border-bottom: none;
  }
`

const ActionIcon = styled.span`
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid ${commandCenterColors.cardBorder};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
`

const ActionTitle = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 15px;
  font-weight: 600;
  color: ${commandCenterColors.white};
  line-height: 1.3;
`

const ActionSubtitle = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 13px;
  font-weight: 400;
  color: ${commandCenterColors.prioritySubtitle};
  line-height: 1.3;
`

const RecRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0;
`

const RecTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

const RecList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`

export const CcSpecTodaysPriorities: React.FC = () => {
  const { recommendations } = useCommandRuntime()
  const actions = recommendations.slice(0, 5)
  const recs = recommendations.slice(0, 4)

  return (
    <div data-cc-spec-priorities>
      <SectionHeading>Today&apos;s Priorities</SectionHeading>
      <PrioritiesGrid>
        <PriorityPanel>
          <PanelSubLabel>Today&apos;s Actions</PanelSubLabel>
          {actions.length === 0 ? (
            <EmptyBlock>
              <EmptyIcon>◎</EmptyIcon>
              <EmptyTitle>No actions queued</EmptyTitle>
              <EmptyDescription>Operational actions from connected runtimes appear here.</EmptyDescription>
            </EmptyBlock>
          ) : (
            actions.map((a) => (
              <ActionRow key={a.id}>
                <ActionIcon>{REC_ICONS[a.icon] ?? '•'}</ActionIcon>
                <div style={{ minWidth: 0 }}>
                  <ActionTitle>{a.title}</ActionTitle>
                  <ActionSubtitle>{a.description}</ActionSubtitle>
                </div>
                <SpecGhostBtn type="button">Open</SpecGhostBtn>
              </ActionRow>
            ))
          )}
        </PriorityPanel>
        <PriorityPanel>
          <PanelSubLabel>AI Recommendations</PanelSubLabel>
          {recs.length === 0 ? (
            <EmptyBlock>
              <EmptyIcon>✦</EmptyIcon>
              <EmptyTitle>No recommendations</EmptyTitle>
              <EmptyDescription>AI guidance surfaces when Projects, Radar, and Build runtimes index data.</EmptyDescription>
            </EmptyBlock>
          ) : (
            <RecList>
              {recs.map((r) => (
                <RecRow key={r.id}>
                  <RecTop>
                    <PriorityBadge>Priority</PriorityBadge>
                    <SpecGhostBtn type="button">View</SpecGhostBtn>
                  </RecTop>
                  <ActionTitle>{r.title}</ActionTitle>
                  <ActionSubtitle>{r.description}</ActionSubtitle>
                </RecRow>
              ))}
            </RecList>
          )}
        </PriorityPanel>
      </PrioritiesGrid>
    </div>
  )
}

/* ── SECTION 5: INFRASTRUCTURE STATUS ── */

const InfraRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${commandCenterLayout.cardGap};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const InfraCard = styled(SpecCard)`
  height: ${commandCenterLayout.infraCardHeight};
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  box-sizing: border-box;
`

const InfraMetric = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: ${commandCenterType.metricInfra};
  font-weight: 700;
  line-height: 1.1;
  color: ${commandCenterColors.white};
`

const InfraDesc = styled.p`
  margin: 0;
  font-family: ${CC_FONT_BODY};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.4;
  color: ${commandCenterColors.body};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

export const CcSpecInfrastructureStatus: React.FC = () => {
  const { infrastructureSummary, builderStatus } = useCommandRuntime()
  const projectCount = infrastructureSummary.tokens
  const radarScore = infrastructureSummary.score
  const buildLevel = builderStatus.level

  const cards = [
    {
      id: 'projects',
      label: 'Projects',
      badge: projectCount > 0 ? ('green' as const) : ('gray' as const),
      badgeText: projectCount > 0 ? 'Indexed' : 'Awaiting',
      metric: String(projectCount),
      explain: 'Indexed projects from registry runtime.',
    },
    {
      id: 'radar',
      label: 'Radar',
      badge: radarScore > 50 ? ('green' as const) : radarScore > 0 ? ('yellow' as const) : ('gray' as const),
      badgeText: radarScore > 0 ? 'Active' : 'Standby',
      metric: String(radarScore),
      explain: 'Operational intelligence score from Radar runtime.',
    },
    {
      id: 'build',
      label: 'Build',
      badge: buildLevel > 1 ? ('green' as const) : ('yellow' as const),
      badgeText: buildLevel > 1 ? 'Building' : 'Ready',
      metric: `L${buildLevel}`,
      explain: 'Builder level from Build Studio orchestration.',
    },
  ]

  return (
    <div data-cc-spec-infrastructure>
      <SectionHeading>Infrastructure Status</SectionHeading>
      <InfraRow>
        {cards.map((c) => (
          <InfraCard key={c.id}>
            <InfraStatusPill $tone={c.badge}>{c.badgeText}</InfraStatusPill>
            <div>
              <PortfolioLabel>{c.label}</PortfolioLabel>
              <InfraMetric style={{ marginTop: 8 }}>{c.metric}</InfraMetric>
            </div>
            <InfraDesc>{c.explain}</InfraDesc>
          </InfraCard>
        ))}
      </InfraRow>
    </div>
  )
}

/* ── SECTION 6: RECENT ACTIVITY ── */

const ActivityCard = styled(SpecCard)`
  min-height: ${commandCenterLayout.activityHeight};
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden;
  box-sizing: border-box;
`

const ActivityList = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`

const ActivityRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  height: ${commandCenterLayout.activityRowHeight};
  min-height: ${commandCenterLayout.activityRowHeight};
  border-bottom: 1px solid ${commandCenterColors.divider};

  &:last-child {
    border-bottom: none;
  }
`

const ActivityMiddle = styled.div`
  flex: 1;
  min-width: 0;
`

const ActivityRight = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
`

const TimelineDot = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${commandCenterColors.gold};
  flex-shrink: 0;
`

const ActivityTitle = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 15px;
  font-weight: 700;
  color: ${commandCenterColors.white};
  line-height: 1.3;
`

const ActivityModule = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 13px;
  font-weight: 400;
  color: ${commandCenterColors.muted};
  line-height: 1.3;
`

const ActivityTime = styled.span`
  font-family: ${CC_FONT_BODY};
  font-size: 13px;
  font-weight: 400;
  color: ${commandCenterColors.muted};
  white-space: nowrap;
`

export const CcSpecRecentActivity: React.FC = () => {
  const { recentActivity } = useCommandRuntime()
  const rows = recentActivity.slice(0, 8)

  return (
    <div data-cc-spec-activity>
      <SectionHeading>Recent Activity</SectionHeading>
      <ActivityCard>
        {rows.length === 0 ? (
          <EmptyBlock>
            <EmptyIcon>◇</EmptyIcon>
            <EmptyTitle>No recent activity yet</EmptyTitle>
            <EmptyDescription>
              The civilization will appear here as soon as new events are produced.
            </EmptyDescription>
          </EmptyBlock>
        ) : (
          <ActivityList>
            {rows.map((row) => {
              const parsed = parseActivityRow(row.label)
              return (
                <ActivityRow key={row.id}>
                  <TimelineDot aria-hidden />
                  <ActivityMiddle>
                    <ActivityTitle>{parsed.action}</ActivityTitle>
                    <ActivityModule>{parsed.module}</ActivityModule>
                  </ActivityMiddle>
                  <ActivityRight>
                    <StatusBadge $tone="green">Indexed</StatusBadge>
                    <ActivityTime>{row.time}</ActivityTime>
                  </ActivityRight>
                </ActivityRow>
              )
            })}
          </ActivityList>
        )}
      </ActivityCard>
    </div>
  )
}

/* ── SECTION 7: NOTIFICATIONS ── */

const NotificationsCard = styled(SpecCard)`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
  box-sizing: border-box;
`

const NotifGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const GroupLabel = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${commandCenterColors.muted};
  margin-bottom: 8px;
`

const NotifRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 12px;
  align-items: center;
  height: ${commandCenterLayout.notificationRowHeight};
  min-height: ${commandCenterLayout.notificationRowHeight};
  border-bottom: 1px solid ${commandCenterColors.divider};
  padding: 0;

  &:last-child {
    border-bottom: none;
  }
`

const NotifText = styled.div`
  min-width: 0;
`

const NotifTitle = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 15px;
  font-weight: 600;
  color: ${commandCenterColors.white};
  line-height: 1.3;
`

const NotifSubtitle = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 13px;
  font-weight: 400;
  color: ${commandCenterColors.prioritySubtitle};
  line-height: 1.3;
`

const NotifTime = styled.span`
  font-family: ${CC_FONT_BODY};
  font-size: 13px;
  color: ${commandCenterColors.muted};
  white-space: nowrap;
`

export const CcSpecNotifications: React.FC = () => {
  const { notifications } = useCommandRuntime()
  const items = notifications.slice(0, 6)

  const grouped = useMemo(() => {
    const map: Record<string, typeof items> = { Today: [], Yesterday: [], Earlier: [] }
    items.forEach((n) => {
      const g = notificationGroup(n.time)
      map[g].push(n)
    })
    return map
  }, [items])

  return (
    <div data-cc-spec-notifications>
      <SectionHeading>Notifications</SectionHeading>
      <NotificationsCard>
        {items.length === 0 ? (
          <EmptyBlock>
            <EmptyIcon>◉</EmptyIcon>
            <EmptyTitle>No notifications</EmptyTitle>
            <EmptyDescription>Trade, pool, farm, and radar events notify you here.</EmptyDescription>
          </EmptyBlock>
        ) : (
          (['Today', 'Yesterday', 'Earlier'] as const).map((group) =>
            grouped[group].length > 0 ? (
              <NotifGroup key={group}>
                <GroupLabel>{group}</GroupLabel>
                {grouped[group].map((n) => {
                  const parsed = parseNotificationTitle(n.title)
                  return (
                    <NotifRow key={n.id}>
                      <NotifText>
                        <NotifTitle>{parsed.title}</NotifTitle>
                        {parsed.subtitle ? <NotifSubtitle>{parsed.subtitle}</NotifSubtitle> : null}
                      </NotifText>
                      <NotifTime>{n.time}</NotifTime>
                      <SpecGhostBtn type="button">Open</SpecGhostBtn>
                    </NotifRow>
                  )
                })}
              </NotifGroup>
            ) : null,
          )
        )}
      </NotificationsCard>
    </div>
  )
}

/* ── SECTION 8: SETTLEMENT ── */

const SettlementCard = styled(SpecCard)`
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  box-sizing: border-box;
`

const SettlementHeading = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 15px;
  font-weight: 600;
  color: ${commandCenterColors.white};
`

const SettlementSentence = styled.p`
  margin: 0;
  font-family: ${CC_FONT_BODY};
  font-size: 15px;
  font-weight: 400;
  line-height: ${commandCenterType.lineHeight};
  color: ${commandCenterColors.body};
`

const SettlementDetail = styled.p`
  margin: 0;
  font-family: ${CC_FONT_BODY};
  font-size: 15px;
  font-weight: 400;
  line-height: ${commandCenterType.lineHeight};
  color: ${commandCenterColors.body};
`

export const CcSpecSettlement: React.FC = () => {
  const { settlement } = useCommandRuntime()
  const available = Boolean(settlement.settlementId || settlement.txHash)
  const copy = settlementDisplay(settlement.label)

  return (
    <div data-cc-spec-settlement>
      <SectionHeading>Settlement</SectionHeading>
      <SettlementCard>
        <SettlementHeading>Latest Settlement</SettlementHeading>
        <SettlementSentence>{copy.primary}</SettlementSentence>
        {copy.detail ? <SettlementDetail>{copy.detail}</SettlementDetail> : null}
        <SpecTreasuryGhostBtn type="button" $disabled={!available} style={{ marginTop: 8 }}>
          Open Treasury
        </SpecTreasuryGhostBtn>
      </SettlementCard>
    </div>
  )
}

/* ── SECTION 9: MACHINE SUMMARY ── */

const MachineCard = styled(SpecCard)<{ $expanded?: boolean }>`
  height: ${({ $expanded }) =>
    $expanded ? commandCenterLayout.machineExpandedHeight : commandCenterLayout.machineCollapsedHeight};
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: height ${commandCenterColors.transition} ease;
  box-sizing: border-box;
`

const MachineBar = styled.div`
  height: ${commandCenterLayout.machineCollapsedHeight};
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
`

const MachineBarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`

const MachineSchema = styled.span`
  font-family: ${CC_FONT_BODY};
  font-size: 12px;
  color: ${commandCenterColors.muted};
`

const MachineExpandBtn = styled(SpecGhostBtn)`
  margin-left: auto;
  flex-shrink: 0;
`

const MachineBody = styled.div`
  flex: 1;
  min-height: 0;
  padding-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const JsonBlock = styled.pre`
  margin: 0;
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid ${commandCenterColors.cardBorder};
  background: rgba(0, 0, 0, 0.25);
  font-family: 'SF Mono', Menlo, monospace;
  font-size: 11px;
  line-height: 1.5;
  color: ${commandCenterColors.body};
  white-space: pre-wrap;
  word-break: break-word;
`

const MachineActions = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`

export const CcSpecMachineSummary: React.FC = () => {
  const { machine } = useCommandRuntime()
  const [expanded, setExpanded] = useState(false)
  const jsonText = useMemo(() => JSON.stringify(machine, null, 2), [machine])

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(jsonText).catch(() => undefined)
    }
  }

  const handleDownload = () => {
    if (typeof document === 'undefined') return
    const blob = new Blob([jsonText], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'melega-command-center.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <MachineCard data-cc-spec-machine $expanded={expanded}>
      <MachineBar data-cc-machine-bar>
        <MachineBarLeft>
          <SpecLabel style={{ fontWeight: 700, color: commandCenterColors.white }}>Machine Summary</SpecLabel>
          <MachineSchema>melega.command-center.v1</MachineSchema>
        </MachineBarLeft>
        <MachineExpandBtn type="button" onClick={() => setExpanded((v) => !v)}>
          {expanded ? 'Collapse' : 'Expand'}
        </MachineExpandBtn>
      </MachineBar>
      {expanded && (
        <MachineBody>
          <JsonBlock>{jsonText}</JsonBlock>
          <MachineActions>
            <SpecPrimaryBtn type="button" onClick={handleDownload}>
              Download JSON
            </SpecPrimaryBtn>
            <SpecSecondaryBtn type="button" onClick={handleCopy}>
              Copy
            </SpecSecondaryBtn>
          </MachineActions>
        </MachineBody>
      )}
    </MachineCard>
  )
}
