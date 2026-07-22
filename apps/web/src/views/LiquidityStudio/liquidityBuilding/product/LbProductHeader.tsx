import React from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { ArrowLeft, ChartNoAxesCombined } from 'lucide-react'
import { ChainId } from '@pancakeswap/sdk'
import { useNetwork } from 'wagmi'
import type { ProgramStatus } from '../programStatus'
import { lb } from './lbProductTokens'

const Wrap = styled.header`
  width: 100%;
  margin-bottom: 24px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const Left = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
`

const BackBtn = styled.button`
  height: 36px;
  padding: 0 12px;
  margin-bottom: 16px;
  border-radius: 10px;
  border: 0;
  background: transparent;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: ${lb.muted};
  font-family: ${lb.font};
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #141414;
    color: ${lb.text};
  }
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const IconBox = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: rgba(244, 196, 48, 0.1);
  border: 1px solid rgba(244, 196, 48, 0.24);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  @media (max-width: 390px) {
    width: 40px;
    height: 40px;
  }
`

const Title = styled.h1`
  margin: 0;
  font-size: 36px;
  line-height: 44px;
  font-weight: 600;
  letter-spacing: -0.8px;
  color: ${lb.text};
  font-family: ${lb.font};

  @media (max-width: 390px) {
    font-size: 30px;
    line-height: 37px;
  }
`

const Subtitle = styled.p`
  margin: 8px 0 0;
  max-width: 700px;
  font-size: 15px;
  line-height: 23px;
  font-weight: 400;
  color: ${lb.muted};
  font-family: ${lb.font};
`

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 52px;
  flex-shrink: 0;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    padding-top: 0;
  }
`

const EnvBadge = styled.span`
  height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid ${lb.border};
  background: ${lb.card};
  color: ${lb.muted2};
  font-size: 11px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  font-family: ${lb.font};
`

const StateBadge = styled.span<{ $tone: string }>`
  height: 30px;
  padding: 0 11px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.35px;
  font-family: ${lb.font};
  ${({ $tone }) => $tone}
`

export type LbProductStateBadge =
  | 'NOT CONFIGURED'
  | 'ACTIVATION PENDING'
  | 'ACTIVE'
  | 'PAUSED'
  | 'SAFETY PAUSED'
  | 'ERROR'
  | 'BUDGET DEPLETED'
  | 'STOPPED'

const TONE: Record<LbProductStateBadge, string> = {
  'NOT CONFIGURED': 'border:1px solid #3A3A3A;background:#151515;color:#A1A1A1;',
  'ACTIVATION PENDING':
    'border:1px solid rgba(245,158,11,0.45);background:rgba(245,158,11,0.08);color:#F59E0B;',
  ACTIVE: 'border:1px solid rgba(34,197,94,0.45);background:rgba(34,197,94,0.08);color:#22C55E;',
  PAUSED: 'border:1px solid rgba(245,158,11,0.45);background:rgba(245,158,11,0.08);color:#F59E0B;',
  'SAFETY PAUSED':
    'border:1px solid rgba(239,68,68,0.45);background:rgba(239,68,68,0.08);color:#EF4444;',
  ERROR: 'border:1px solid rgba(239,68,68,0.45);background:rgba(239,68,68,0.08);color:#EF4444;',
  'BUDGET DEPLETED': 'border:1px solid #3A3A3A;background:#151515;color:#B5B5B5;',
  STOPPED: 'border:1px solid #3A3A3A;background:#151515;color:#B5B5B5;',
}

export function resolveProductStateBadge(input: {
  status: ProgramStatus
  activationPending: boolean
  programSource: 'ON_CHAIN' | 'UNAVAILABLE'
  phase?: string
}): LbProductStateBadge {
  const { status, activationPending, programSource, phase } = input
  if (status === 'ACTIVE') return 'ACTIVE'
  if (status === 'PAUSED') return 'PAUSED'
  if (status === 'SAFETY_PAUSED') return 'SAFETY PAUSED'
  if (status === 'ERROR') return 'ERROR'
  if (status === 'BUDGET_DEPLETED') return 'BUDGET DEPLETED'
  if (status === 'STOPPED') return 'STOPPED'
  if (phase === 'status' || phase === 'review') {
    if (activationPending) return 'ACTIVATION PENDING'
  }
  if (status === 'NOT_ACTIVE' || status === 'SETUP_REQUIRED' || programSource !== 'ON_CHAIN') {
    return 'NOT CONFIGURED'
  }
  if (activationPending) return 'ACTIVATION PENDING'
  return 'NOT CONFIGURED'
}

function environmentLabel(chainId: number | undefined): string {
  if (chainId === ChainId.BSC) return 'Mainnet'
  if (chainId === ChainId.BSC_TESTNET) return 'Testnet'
  if (chainId == null) return 'Local Fork'
  return 'Local Fork'
}

export function LbProductHeader({
  status,
  activationPending,
  programSource,
  phase,
}: {
  status: ProgramStatus
  activationPending: boolean
  programSource: 'ON_CHAIN' | 'UNAVAILABLE'
  phase?: string
}) {
  const router = useRouter()
  const { chain } = useNetwork()
  const badge = resolveProductStateBadge({ status, activationPending, programSource, phase })

  return (
    <Wrap data-testid="lb-product-header">
      <Left>
        <BackBtn
          type="button"
          data-testid="lb-back-to-studio"
          onClick={() => router.push('/liquidity-studio')}
        >
          <ArrowLeft size={16} strokeWidth={1.75} aria-hidden />
          Back to Liquidity Studio
        </BackBtn>
        <TitleRow>
          <IconBox aria-hidden>
            <ChartNoAxesCombined size={23} strokeWidth={1.75} color={lb.gold} />
          </IconBox>
          <Title>Liquidity Building</Title>
        </TitleRow>
        <Subtitle>
          Transform your token reserve into real liquidity automatically and progressively.
        </Subtitle>
      </Left>
      <Right>
        <EnvBadge data-testid="lb-env-badge">{environmentLabel(chain?.id)}</EnvBadge>
        <StateBadge data-testid="lb-product-state-badge" data-state={badge} $tone={TONE[badge]}>
          {badge}
        </StateBadge>
      </Right>
    </Wrap>
  )
}
