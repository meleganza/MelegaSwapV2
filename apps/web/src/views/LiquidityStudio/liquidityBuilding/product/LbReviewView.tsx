import React from 'react'
import styled from 'styled-components'
import { Clock3, ShieldCheck } from 'lucide-react'
import { ChainId } from '@pancakeswap/sdk'
import { useNetwork } from 'wagmi'
import type { LiquidityBuildingCardState } from '../useLiquidityBuildingCard'
import { LB_UX } from '../uxCopy'
import { lb } from './lbProductTokens'

const Shell = styled.div`
  max-width: 960px;
  margin-left: auto;
  margin-right: auto;
`

const Card = styled.section`
  padding: 28px;
  border-radius: 20px;
  background: ${lb.card};
  border: 1px solid ${lb.border};
  box-sizing: border-box;

  @media (max-width: 390px) {
    padding: 20px;
  }
`

const Title = styled.h2`
  margin: 0;
  font-size: 24px;
  line-height: 31px;
  font-weight: 600;
  color: ${lb.text};
`

const Desc = styled.p`
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 20px;
  color: ${lb.muted};
`

const Section = styled.section`
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid ${lb.borderSoft};
`

const SectionTitle = styled.h3`
  margin: 0;
  font-size: 12px;
  line-height: 17px;
  font-weight: 600;
  color: ${lb.text};
`

const Grid = styled.div`
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const Item = styled.div`
  min-height: 66px;
  padding: 12px;
  border-radius: 12px;
  background: ${lb.input};
  border: 1px solid ${lb.borderSoft};
  box-sizing: border-box;
`

const ItemLabel = styled.div`
  font-size: 9px;
  line-height: 13px;
  font-weight: 600;
  letter-spacing: 0.35px;
  color: ${lb.muted6};
  text-transform: uppercase;
`

const ItemValue = styled.div`
  margin-top: 6px;
  font-size: 12px;
  line-height: 17px;
  font-weight: 600;
  color: ${lb.text};
`

const ItemSupport = styled.div`
  margin-top: 3px;
  font-size: 10px;
  line-height: 15px;
  color: ${lb.muted4};
`

const ProtectRow = styled.div`
  min-height: 30px;
  display: grid;
  grid-template-columns: 18px 1fr auto;
  gap: 9px;
  align-items: center;
  margin-top: 8px;
`

const ProtectLabel = styled.span`
  font-size: 11px;
  line-height: 16px;
  color: #d4d4d4;
`

const ProtectStatus = styled.span<{ $ok?: boolean }>`
  font-size: 9px;
  line-height: 14px;
  font-weight: 700;
  color: ${({ $ok }) => ($ok ? lb.success : lb.muted5)};
  text-transform: uppercase;
`

const ReadyBlock = styled.div<{ $tone: 'pending' | 'ready' | 'blocked' | 'failed' }>`
  margin-top: 16px;
  padding: 16px;
  border-radius: 14px;
  display: grid;
  grid-template-columns: 22px 1fr;
  gap: 12px;
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'ready'
        ? 'rgba(34,197,94,0.34)'
        : $tone === 'failed' || $tone === 'blocked'
          ? 'rgba(239,68,68,0.34)'
          : 'rgba(245,158,11,0.34)'};
  background: ${({ $tone }) =>
    $tone === 'ready'
      ? 'rgba(34,197,94,0.055)'
      : $tone === 'failed' || $tone === 'blocked'
        ? 'rgba(239,68,68,0.055)'
        : 'rgba(245,158,11,0.055)'};
`

const ReadyTitle = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${lb.text};
`

const ReadyBody = styled.div`
  margin-top: 3px;
  font-size: 10px;
  line-height: 15px;
  color: ${lb.muted};
`

const Footer = styled.div`
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid ${lb.borderSoft};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;

  @media (max-width: 390px) {
    flex-direction: column-reverse;
    & > button {
      width: 100%;
    }
  }
`

const EditBtn = styled.button`
  height: 44px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid ${lb.border};
  background: transparent;
  color: #d4d4d4;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
`

const PrimaryBtn = styled.button<{ $pending?: boolean; $disabled?: boolean }>`
  height: 44px;
  min-width: 176px;
  padding: 0 18px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 700;
  font-family: ${lb.font};
  ${({ $pending, $disabled }) =>
    $pending
      ? `border:1px solid #3A3420;background:#292616;color:#8E7B37;cursor:not-allowed;`
      : $disabled
        ? `border:0;background:#333;color:#747474;cursor:not-allowed;`
        : `border:0;background:${lb.gold};color:${lb.ink};cursor:pointer;`}
`

const PROTECTIONS: { label: string; enforced: boolean }[] = [
  { label: 'Budget hard cap', enforced: true },
  { label: 'Maximum per-decision usage', enforced: true },
  { label: 'Price-impact protection', enforced: true },
  { label: 'Slippage protection', enforced: true },
  { label: 'Transaction deadline', enforced: true },
  { label: 'Anomaly pause', enforced: true },
  { label: 'Duplicate-execution protection', enforced: true },
  { label: 'Own-volume exclusion', enforced: true },
]

function envLabel(chainId?: number) {
  if (chainId === ChainId.BSC) return 'Mainnet'
  if (chainId === ChainId.BSC_TESTNET) return 'Testnet'
  return 'Local Fork'
}

export function LbReviewView({
  card,
  onOpenStatus,
}: {
  card: LiquidityBuildingCardState
  onOpenStatus: () => void
}) {
  const { chain } = useNetwork()
  const destination = card.pairDetection.available
    ? `${card.draft.tokenSymbol}/${card.pairDetection.quoteSymbol}`
    : 'Not available'

  const readinessTone =
    card.readiness.uiMode === 'available'
      ? 'ready'
      : card.readiness.uiMode === 'blocked'
        ? 'blocked'
        : card.readiness.healthStatus === 'ERROR' || card.readiness.healthStatus === 'FAILED'
          ? 'failed'
          : 'pending'

  const readinessCopy =
    readinessTone === 'ready'
      ? {
          title: 'Ready for activation',
          body: 'All required production checks are complete.',
        }
      : readinessTone === 'blocked'
        ? {
            title: 'Activation unavailable',
            body: 'One or more required production checks are incomplete.',
          }
        : readinessTone === 'failed'
          ? {
              title: 'Readiness check failed',
              body: 'Activation status could not be verified. Try again later.',
            }
          : {
              title: 'Activation requirements pending',
              body: 'Your configuration is valid. Production activation is not available yet.',
            }

  const primaryLabel = !card.mutateGate.ok
    ? 'Activation Pending'
    : card.status === 'AWAITING_APPROVAL'
      ? 'Approve Token'
      : card.status === 'AWAITING_DEPOSIT'
        ? 'Deposit Token Budget'
        : 'Activate Liquidity Building'

  const activationBlocked = !card.mutateGate.ok

  return (
    <Shell data-testid="lb-review-view">
      <Card>
        <Title>Review your program</Title>
        <Desc>Confirm the configuration before approvals and activation requirements are evaluated.</Desc>

        <Section>
          <SectionTitle>Program configuration</SectionTitle>
          <Grid>
            {[
              ['Token', card.draft.tokenSymbol || '—'],
              ['Budget', card.draft.tokenBudget || '—', card.draft.tokenSymbol || undefined],
              [
                'Strategy',
                card.draft.strategy === 'FULL_AI' ? 'Full AI' : 'Dynamic Range',
                card.draft.strategy === 'FULL_AI' ? 'Recommended' : 'Advanced',
              ],
              ['Decision Frequency', card.decisionFrequencyLabel],
              ['Destination Pair', destination],
              ['LP Owner', LB_UX.lpOwnedByOwner],
              ['Success Fee', '5% on quote acquired'],
              ['Environment', envLabel(chain?.id)],
            ].map(([label, value, support]) => (
              <Item key={label as string}>
                <ItemLabel>{label}</ItemLabel>
                <ItemValue>{value}</ItemValue>
                {support ? <ItemSupport>{support}</ItemSupport> : null}
              </Item>
            ))}
          </Grid>
        </Section>

        <Section>
          <SectionTitle>Automatic protections</SectionTitle>
          {PROTECTIONS.map((p) => (
            <ProtectRow key={p.label}>
              <ShieldCheck size={15} color={lb.gold} aria-hidden />
              <ProtectLabel>{p.label}</ProtectLabel>
              <ProtectStatus $ok={p.enforced}>{p.enforced ? 'ENFORCED' : 'NOT AVAILABLE'}</ProtectStatus>
            </ProtectRow>
          ))}
        </Section>

        <Section>
          <SectionTitle>Ownership and fees</SectionTitle>
          <Grid>
            <Item>
              <ItemLabel>LP Ownership</ItemLabel>
              <ItemValue>{LB_UX.lpOwnedByOwner}</ItemValue>
              <ItemSupport>Owner-controlled / Unlocked</ItemSupport>
            </Item>
            <Item>
              <ItemLabel>Success Fee</ItemLabel>
              <ItemValue>5%</ItemValue>
              <ItemSupport>Applies only to quote assets actually acquired</ItemSupport>
            </Item>
          </Grid>
        </Section>

        <Section>
          <SectionTitle>Activation readiness</SectionTitle>
          <ReadyBlock
            $tone={readinessTone}
            data-testid="lb-review-activation-pending"
            data-lb-readiness={readinessTone}
          >
            <Clock3 size={20} color={readinessTone === 'ready' ? lb.success : lb.warn} aria-hidden />
            <div>
              <ReadyTitle>{readinessCopy.title}</ReadyTitle>
              <ReadyBody>{readinessCopy.body}</ReadyBody>
            </div>
          </ReadyBlock>
        </Section>

        <Footer>
          <EditBtn type="button" data-testid="lb-edit-configuration" onClick={card.backToSetup}>
            Edit Configuration
          </EditBtn>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {activationBlocked ? (
              <EditBtn type="button" data-testid="lb-view-activation-status" onClick={onOpenStatus}>
                View Activation Status
              </EditBtn>
            ) : null}
            <PrimaryBtn
              type="button"
              data-testid="lb-primary-cta"
              data-lb-mutating-blocked={activationBlocked ? 'true' : 'false'}
              $pending={activationBlocked}
              $disabled={activationBlocked}
              disabled={activationBlocked}
              onClick={() => {
                if (activationBlocked) {
                  onOpenStatus()
                  return
                }
                card.requestDepositAndActivate()
              }}
            >
              {primaryLabel}
            </PrimaryBtn>
          </div>
        </Footer>
      </Card>
    </Shell>
  )
}
