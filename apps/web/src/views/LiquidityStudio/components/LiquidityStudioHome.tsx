import React, { useMemo } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { ds001FontFamily, ds001Layout } from 'design-system/melega/tokens/ds001'
import { LB_SUCCESS_FEE_BPS, LB_BPS } from 'lib/liquidity-building-runtime/types'
import { useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'
import { useLiquidityBuildingCard } from '../liquidityBuilding/useLiquidityBuildingCard'
import { useActivationReadiness } from '../liquidityBuilding/useActivationReadiness'
import type { ProgramStatus } from '../liquidityBuilding/programStatus'
import {
  IconArrowRight,
  IconBadgePercent,
  IconBrainCircuit,
  IconChartIncreasing,
  IconCircleCheck,
  IconDroplet,
  IconDroplets,
  IconInfo,
  IconLockKeyhole,
  IconShieldCheck,
} from './LiquidityStudioIcons'

const Page = styled.div`
  width: 100%;
  max-width: ${ds001Layout.contentMaxWidth};
  margin: 0 auto;
  box-sizing: border-box;
  padding-bottom: 64px;
`

const Hero = styled.header`
  width: 100%;
  min-height: 96px;
  margin-bottom: 24px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 32px;

  @media (max-width: 767px) {
    flex-direction: column;
    gap: 16px;
  }
`

const HeroLeft = styled.div`
  max-width: 720px;
  min-width: 0;
`

const Title = styled.h1`
  margin: 0;
  font-family: ${ds001FontFamily.sans};
  font-size: 48px;
  line-height: 56px;
  font-weight: 600;
  letter-spacing: -1.2px;
  color: #ffffff;

  @media (max-width: 390px) {
    font-size: 36px;
    line-height: 42px;
  }
`

const Subtitle = styled.p`
  margin: 8px 0 0;
  max-width: 640px;
  font-family: ${ds001FontFamily.sans};
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  color: #b5b5b5;
`

const HeroRight = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 4px;
  flex-shrink: 0;
  flex-wrap: wrap;

  @media (max-width: 767px) {
    width: 100%;
  }
`

const LiveBadge = styled.div<{ $live?: boolean }>`
  height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid ${({ $live }) => ($live ? '#22c55e' : '#F59E0B')};
  background: ${({ $live }) => ($live ? 'rgba(34, 197, 94, 0.04)' : 'rgba(245, 158, 11, 0.06)')};
  color: ${({ $live }) => ($live ? '#22c55e' : '#F59E0B')};
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  line-height: 18px;
  font-weight: 600;
`

const LiveDot = styled.span<{ $live?: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: ${({ $live }) => ($live ? '#22c55e' : '#F59E0B')};
`

const GhostBtn = styled(Link)`
  height: 40px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid #2a2a2a;
  background: transparent;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  text-decoration: none;

  &:hover {
    border-color: #3a3a3a;
  }

  &:focus-visible {
    outline: 2px solid #f4c430;
    outline-offset: 3px;
  }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 24px;
  align-items: stretch;

  @media (max-width: 1279px) {
    gap: 20px;
  }

  @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
`

const ProductCard = styled.article<{ $recommended?: boolean }>`
  grid-column: span 4;
  min-height: 320px;
  padding: 24px;
  border-radius: 20px;
  background: ${({ $recommended }) =>
    $recommended
      ? `linear-gradient(180deg, rgba(244, 196, 48, 0.055) 0%, rgba(18, 18, 18, 1) 32%, rgba(18, 18, 18, 1) 100%)`
      : '#121212'};
  border: 1px solid ${({ $recommended }) => ($recommended ? '#b78e00' : '#2a2a2a')};
  box-shadow: ${({ $recommended }) => ($recommended ? 'inset 0 1px 0 rgba(255,255,255,0.025)' : 'none')};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background-color 160ms ease;

  &:hover {
    transform: translateY(-1px);
    border-color: ${({ $recommended }) => ($recommended ? '#f4c430' : '#3a3a3a')};
    background: ${({ $recommended }) =>
      $recommended
        ? `linear-gradient(180deg, rgba(244, 196, 48, 0.075) 0%, rgba(21, 21, 21, 1) 34%, rgba(21, 21, 21, 1) 100%)`
        : '#151515'};
  }

  @media (max-width: 1279px) and (min-width: 768px) {
    grid-column: span 6;
  }

  @media (max-width: 767px) {
    width: 100%;
    padding: 20px;
    order: ${({ $recommended }) => ($recommended ? 0 : 1)};
  }
`

const Recommended = styled.span`
  position: absolute;
  top: 20px;
  right: 20px;
  height: 22px;
  padding: 0 9px;
  border-radius: 999px;
  background: #f4c430;
  color: #080808;
  font-size: 9px;
  line-height: 22px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`

const TitleRow = styled.div<{ $padRight?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: ${({ $padRight }) => ($padRight ? '100px' : '0')};
`

const IconBox = styled.div<{ $tone: 'blue' | 'gold' }>`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: ${({ $tone }) =>
    $tone === 'blue' ? 'rgba(59, 130, 246, 0.10)' : 'rgba(244, 196, 48, 0.10)'};
  border: 1px solid
    ${({ $tone }) => ($tone === 'blue' ? 'rgba(59, 130, 246, 0.22)' : 'rgba(244, 196, 48, 0.25)')};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ $tone }) => ($tone === 'blue' ? '#60a5fa' : '#f4c430')};
  flex-shrink: 0;
`

const CardTitle = styled.h2<{ $gold?: boolean }>`
  margin: 0;
  font-size: 22px;
  line-height: 28px;
  font-weight: 600;
  color: ${({ $gold }) => ($gold ? '#f4c430' : '#ffffff')};
`

const CardDesc = styled.p<{ $wide?: boolean }>`
  margin: 8px 0 0;
  max-width: ${({ $wide }) => ($wide ? '320px' : '310px')};
  font-size: 14px;
  line-height: 21px;
  color: ${({ $wide }) => ($wide ? '#a1a1a1' : '#d4d4d4')};
`

const Illu = styled.div`
  height: 96px;
  margin-top: 24px;
  margin-bottom: 18px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 10px;
`

const TokenCircle = styled.div<{ $variant: 'blue' | 'gold' }>`
  width: 58px;
  height: 58px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  color: rgba(255, 255, 255, 0.8);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  background: ${({ $variant }) =>
    $variant === 'blue'
      ? 'linear-gradient(180deg, #1e3a5f, #2563eb)'
      : 'linear-gradient(180deg, #d9a500, #f4c430)'};
  border: 1px solid
    ${({ $variant }) =>
      $variant === 'blue' ? 'rgba(96, 165, 250, 0.35)' : 'rgba(244, 196, 48, 0.45)'};
  margin-left: ${({ $variant }) => ($variant === 'gold' ? '-14px' : '0')};
`

const BuildIllu = styled.div`
  height: 96px;
  margin-top: 24px;
  margin-bottom: 18px;
  display: flex;
  align-items: flex-end;
  gap: 7px;
  padding-left: 12px;
`

const CoinStack = styled.div`
  display: flex;
  flex-direction: column;
  width: 48px;
  margin-right: 8px;
`

const Coin = styled.div`
  width: 48px;
  height: 13px;
  border-radius: 50%;
  background: linear-gradient(180deg, #ffd34d, #b78e00);
  border: 1px solid rgba(244, 196, 48, 0.45);
  margin-top: -5px;

  &:first-child {
    margin-top: 0;
  }
`

const Bar = styled.div<{ $h: number; $op: number }>`
  width: 10px;
  height: ${({ $h }) => $h}px;
  border-radius: 4px 4px 1px 1px;
  background: linear-gradient(180deg, #f4c430 0%, #8a6500 100%);
  opacity: ${({ $op }) => $op};
`

const Benefits = styled.ul`
  list-style: none;
  margin: 0 0 24px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Benefit = styled.li`
  min-height: 20px;
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 13px;
  line-height: 18px;
  color: #d4d4d4;

  svg {
    color: #f4c430;
    flex-shrink: 0;
  }
`

const PrimaryCta = styled(Link)`
  margin-top: auto;
  width: 100%;
  height: 48px;
  border-radius: 14px;
  border: 0;
  background: #f4c430;
  color: #080808;
  font-size: 15px;
  line-height: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid #f4c430;
    outline-offset: 3px;
  }

  @media (max-width: 390px) {
    width: 100%;
  }
`

const StatusCol = styled.aside`
  grid-column: span 4;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 1279px) and (min-width: 768px) {
    grid-column: span 12;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  @media (max-width: 767px) {
    order: 2;
    width: 100%;
    display: flex;
    flex-direction: column;
  }
`

const StatusCard = styled.section`
  min-height: 148px;
  padding: 20px;
  border-radius: 18px;
  background: #121212;
  border: 1px solid #2a2a2a;
`

const OverviewCard = styled(StatusCard)`
  min-height: 156px;
`

const StatusHead = styled.div`
  display: flex;
  align-items: center;
  gap: 7px;
`

const StatusTitle = styled.h3`
  margin: 0;
  font-size: 15px;
  line-height: 20px;
  font-weight: 600;
  color: #ffffff;
`

const StateRow = styled.div`
  margin-top: 18px;
  display: grid;
  grid-template-columns: 10px 1fr;
  column-gap: 10px;
  align-items: start;
`

const StateDot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  margin-top: 5px;
  border-radius: 999px;
  background: ${({ $color }) => $color};
`

const StateTitle = styled.div`
  font-size: 13px;
  line-height: 18px;
  font-weight: 600;
  color: #ffffff;
`

const StateBody = styled.p`
  margin: 3px 0 0;
  max-width: 290px;
  font-size: 12px;
  line-height: 17px;
  color: #a1a1a1;
`

const SecondaryCta = styled(Link)<{ $gold?: boolean }>`
  margin-top: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid ${({ $gold }) => ($gold ? '#5b4810' : '#2a2a2a')};
  background: transparent;
  color: ${({ $gold }) => ($gold ? '#f4c430' : '#ffffff')};
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  width: ${({ $gold }) => ($gold ? '100%' : 'auto')};

  &:focus-visible {
    outline: 2px solid #f4c430;
    outline-offset: 3px;
  }
`

const MetricList = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const MetricRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
`

const MetricLabel = styled.span`
  font-size: 12px;
  line-height: 17px;
  color: #a1a1a1;
`

const MetricValue = styled.span`
  font-size: 13px;
  line-height: 18px;
  font-weight: 600;
  color: #ffffff;
  text-align: right;
`

const TrustStrip = styled.section`
  margin-top: 16px;
  width: 100%;
  min-height: 78px;
  padding: 16px 20px;
  border-radius: 16px;
  background: #0f0f0f;
  border: 1px solid #252525;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0;

  @media (max-width: 1023px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`

const TrustItem = styled.div<{ $divider?: boolean }>`
  min-height: 44px;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 32px 1fr;
  column-gap: 12px;
  align-items: center;
  border-left: ${({ $divider }) => ($divider ? '1px solid #252525' : 'none')};

  @media (max-width: 1023px) {
    border-left: none;
    border-top: ${({ $divider }) => ($divider ? '1px solid #252525' : 'none')};
    padding: 12px 8px;
  }

  svg {
    color: #f4c430;
  }
`

const TrustTitle = styled.div`
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  color: #f4c430;
`

const TrustBody = styled.div`
  margin-top: 2px;
  font-size: 11px;
  line-height: 15px;
  color: #9a9a9a;
`

type ProgramUiState = 'none' | 'pending' | 'active' | 'paused'

function mapProgramUi(status: ProgramStatus, activationPending: boolean): ProgramUiState {
  if (status === 'ACTIVE') return 'active'
  if (status === 'SAFETY_PAUSED' || status === 'PAUSED') return 'paused'
  if (
    activationPending ||
    ['SETUP_REQUIRED', 'AWAITING_APPROVAL', 'AWAITING_DEPOSIT', 'READY'].includes(status)
  ) {
    return 'pending'
  }
  return 'none'
}

function formatUsd(value: string | null | undefined): string {
  if (value == null || value === '') return '—'
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
}

const FEE_PCT = (LB_SUCCESS_FEE_BPS / LB_BPS) * 100

const LiquidityStudioHome: React.FC = () => {
  const { liquidityWalletPortfolio, positionsLoading, account } = useLiquidityRuntime()
  const lb = useLiquidityBuildingCard()
  const readiness = useActivationReadiness()
  const runtimeLive = readiness.gates.runtimeReady === true
  const programUi = mapProgramUi(lb.status, lb.activationPending)

  const overview = useMemo(() => {
    const summary = liquidityWalletPortfolio.summary
    const positions = (liquidityWalletPortfolio.positions ?? []).filter(
      (p) => p.positionType === 'LIQUIDITY',
    )
    const connected = Boolean(account)
    if (!connected || positionsLoading) {
      return { lpValue: '—', fees: '—', count: '—' as string }
    }
    const knownEmpty = positions.length === 0
    return {
      lpValue: formatUsd(summary.netWorthUsd),
      fees: formatUsd(summary.claimableValueUsd),
      count: knownEmpty || positions.length > 0 ? String(positions.length) : '—',
    }
  }, [account, liquidityWalletPortfolio, positionsLoading])

  const lbCta =
    programUi === 'active'
      ? 'Open Liquidity Building'
      : programUi === 'pending'
        ? 'View Activation Status'
        : 'Set Up Liquidity Building'

  const programCopy =
    programUi === 'active'
      ? {
          color: '#22c55e',
          title: 'Program active',
          body: `Status: ${lb.status.replace(/_/g, ' ').toLowerCase()}.`,
          cta: 'Open Dashboard',
        }
      : programUi === 'paused'
        ? {
            color: '#ef4444',
            title: 'Safety paused',
            body: lb.programReason || 'Your program is paused for safety. Review requirements to continue.',
            cta: 'Review Program',
          }
        : programUi === 'pending'
          ? {
              color: '#f59e0b',
              title: 'Activation pending',
              body: 'Your program is configured and waiting for activation requirements.',
              cta: 'View Activation Status',
            }
          : {
              color: '#7a7a7a',
              title: 'No active program',
              body: 'Set up a Liquidity Building program to get started.',
              cta: 'View Status',
            }

  return (
    <Page data-testid="liquidity-studio-home" data-ls-view="home">
      <Hero>
        <HeroLeft>
          <Title>Liquidity Studio</Title>
          <Subtitle>Manage your liquidity or let Melega build it for you automatically.</Subtitle>
        </HeroLeft>
        <HeroRight>
          <LiveBadge $live={runtimeLive} data-testid="ls-runtime-badge">
            <LiveDot $live={runtimeLive} aria-hidden />
            {runtimeLive ? 'Live Runtime' : 'Runtime Pending'}
          </LiveBadge>
        </HeroRight>
      </Hero>

      <Grid data-testid="ls-home-product-grid">
        <ProductCard data-testid="ls-card-add-liquidity">
          <TitleRow>
            <IconBox $tone="blue" aria-hidden>
              <IconDroplets size={22} />
            </IconBox>
            <CardTitle>Add Liquidity</CardTitle>
          </TitleRow>
          <CardDesc $wide>Provide liquidity manually in any supported Melega DEX pool.</CardDesc>
          <Illu aria-hidden>
            <TokenCircle $variant="blue">
              <IconDroplet size={24} />
            </TokenCircle>
            <TokenCircle $variant="gold">
              <IconDroplet size={24} />
            </TokenCircle>
          </Illu>
          <Benefits>
            <Benefit>
              <IconCircleCheck size={16} />
              You choose the pool
            </Benefit>
            <Benefit>
              <IconCircleCheck size={16} />
              Earn trading fees
            </Benefit>
            <Benefit>
              <IconCircleCheck size={16} />
              You keep full control
            </Benefit>
          </Benefits>
          <PrimaryCta href="/liquidity-studio?view=add" data-testid="ls-cta-add-liquidity">
            Add Liquidity
            <IconArrowRight size={18} />
          </PrimaryCta>
        </ProductCard>

        <ProductCard $recommended data-testid="ls-card-liquidity-building">
          <Recommended>Recommended</Recommended>
          <TitleRow $padRight>
            <IconBox $tone="gold" aria-hidden>
              <IconChartIncreasing size={23} />
            </IconBox>
            <CardTitle $gold>Liquidity Building</CardTitle>
          </TitleRow>
          <CardDesc>Transform your token reserve into real liquidity automatically.</CardDesc>
          <BuildIllu aria-hidden>
            <CoinStack>
              <Coin />
              <Coin />
              <Coin />
            </CoinStack>
            <Bar $h={22} $op={0.58} />
            <Bar $h={34} $op={0.68} />
            <Bar $h={48} $op={0.78} />
            <Bar $h={64} $op={0.88} />
            <Bar $h={82} $op={1} />
          </BuildIllu>
          <Benefits>
            <Benefit>
              <IconCircleCheck size={16} />
              Automatically builds liquidity
            </Benefit>
            <Benefit>
              <IconCircleCheck size={16} />
              You keep LP ownership
            </Benefit>
            <Benefit>
              <IconCircleCheck size={16} />
              Powered by Full AI strategy
            </Benefit>
          </Benefits>
          <PrimaryCta href="/liquidity-studio?view=building" data-testid="ls-cta-liquidity-building">
            {lbCta}
            <IconArrowRight size={18} />
          </PrimaryCta>
        </ProductCard>

        <StatusCol>
          <StatusCard data-testid="ls-program-status" aria-labelledby="ls-program-status-title">
            <StatusHead>
              <StatusTitle id="ls-program-status-title">Program Status</StatusTitle>
              <span style={{ color: '#7a7a7a' }} aria-hidden>
                <IconInfo size={15} />
              </span>
            </StatusHead>
            <StateRow>
              <StateDot $color={programCopy.color} aria-hidden />
              <div>
                <StateTitle>{programCopy.title}</StateTitle>
                <StateBody>{programCopy.body}</StateBody>
              </div>
            </StateRow>
            <SecondaryCta href="/liquidity-studio?view=building" data-testid="ls-cta-program-status">
              {programCopy.cta}
            </SecondaryCta>
          </StatusCard>

          <OverviewCard data-testid="ls-liquidity-overview" aria-labelledby="ls-liquidity-overview-title">
            <StatusTitle id="ls-liquidity-overview-title">Your Liquidity Overview</StatusTitle>
            <MetricList>
              <MetricRow>
                <MetricLabel>Total LP Value</MetricLabel>
                <MetricValue>{overview.lpValue}</MetricValue>
              </MetricRow>
              <MetricRow>
                <MetricLabel>Unclaimed Fees</MetricLabel>
                <MetricValue>{overview.fees}</MetricValue>
              </MetricRow>
              <MetricRow>
                <MetricLabel>Positions</MetricLabel>
                <MetricValue>{overview.count}</MetricValue>
              </MetricRow>
            </MetricList>
            <SecondaryCta $gold href="/liquidity-studio?view=positions" data-testid="ls-cta-view-portfolio">
              View Portfolio
            </SecondaryCta>
          </OverviewCard>
        </StatusCol>
      </Grid>

      <TrustStrip data-testid="ls-trust-strip" aria-label="Liquidity Studio trust principles">
        <TrustItem>
          <IconShieldCheck size={28} />
          <div>
            <TrustTitle>You keep ownership</TrustTitle>
            <TrustBody>LP tokens always belong to you.</TrustBody>
          </div>
        </TrustItem>
        <TrustItem $divider>
          <IconLockKeyhole size={28} />
          <div>
            <TrustTitle>Transparent & Secure</TrustTitle>
            <TrustBody>On-chain execution with full transparency.</TrustBody>
          </div>
        </TrustItem>
        <TrustItem $divider>
          <IconBrainCircuit size={28} />
          <div>
            <TrustTitle>Optimized by AI</TrustTitle>
            <TrustBody>Full AI strategy adapts to market conditions.</TrustBody>
          </div>
        </TrustItem>
        <TrustItem $divider>
          <IconBadgePercent size={28} />
          <div>
            <TrustTitle>Melega Success Fee</TrustTitle>
            <TrustBody>{`${FEE_PCT}% only on acquired quote assets.`}</TrustBody>
          </div>
        </TrustItem>
      </TrustStrip>
    </Page>
  )
}

export default LiquidityStudioHome
