import React from 'react'
import styled from 'styled-components'
import { Clock3, RefreshCw } from 'lucide-react'
import type { LiquidityBuildingCardState } from '../useLiquidityBuildingCard'
import { lb } from './lbProductTokens'

const Shell = styled.div`
  max-width: 960px;
  margin-left: auto;
  margin-right: auto;
`

const Primary = styled.section`
  padding: 36px;
  border-radius: 22px;
  border: 1px solid rgba(245, 158, 11, 0.36);
  background:
    radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.09), transparent 44%),
    ${lb.card};
  text-align: center;
  box-sizing: border-box;
`

const IconBox = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto;
  border-radius: 20px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;
`

const Title = styled.h2`
  margin: 20px 0 0;
  font-size: 28px;
  line-height: 35px;
  font-weight: 600;
  color: ${lb.text};
`

const Body = styled.p`
  margin: 10px auto 0;
  max-width: 610px;
  font-size: 13px;
  line-height: 20px;
  color: ${lb.muted};
`

const StatusGrid = styled.div`
  margin: 28px auto 0;
  max-width: 700px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const StatusCard = styled.div`
  min-height: 84px;
  padding: 14px;
  border-radius: 13px;
  border: 1px solid ${lb.borderSoft};
  background: ${lb.input};
  text-align: left;
  box-sizing: border-box;
`

const StatusLabel = styled.div`
  font-size: 9px;
  line-height: 13px;
  color: ${lb.muted6};
  text-transform: uppercase;
  letter-spacing: 0.4px;
`

const StatusValue = styled.div<{ $tone: 'ready' | 'pending' | 'blocked' }>`
  margin-top: 8px;
  font-size: 11px;
  line-height: 16px;
  font-weight: 700;
  color: ${({ $tone }) =>
    $tone === 'ready' ? lb.success : $tone === 'blocked' ? lb.danger : lb.warn};
`

const NextCard = styled.section`
  margin-top: 16px;
  padding: 18px;
  border-radius: 16px;
  background: ${lb.cardDeep};
  border: 1px solid ${lb.borderSoft};
  text-align: left;
`

const NextTitle = styled.h3`
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 600;
  color: ${lb.text};
`

const NextRow = styled.div`
  font-size: 11px;
  line-height: 18px;
  color: ${lb.muted2};
  margin-top: 8px;
`

const Actions = styled.div`
  margin-top: 24px;
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
`

const RefreshBtn = styled.button`
  height: 44px;
  padding: 0 18px;
  border-radius: 12px;
  border: 0;
  background: ${lb.gold};
  color: ${lb.ink};
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
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

function pillTone(ready: boolean): 'ready' | 'pending' {
  return ready ? 'ready' : 'pending'
}

export function LbActivationPendingView({
  card,
  onEdit,
}: {
  card: LiquidityBuildingCardState
  onEdit: () => void
}) {
  const contractsReady = card.readiness.contracts === 'Ready'
  const runtimeReady = card.readiness.runtime === 'Ready'
  const activationReady = card.readiness.activation === 'Ready'

  return (
    <Shell data-testid="lb-activation-pending-view">
      <Primary
        data-testid="lb-blocked-banner"
        data-lb-ui-mode={card.readiness.uiMode}
        data-lb-product-status={card.readiness.productStatus}
      >
        <IconBox>
          <Clock3 size={28} color={lb.warn} strokeWidth={1.7} aria-hidden />
        </IconBox>
        <Title>Activation Pending</Title>
        <Body>
          Your Liquidity Building configuration is ready. Production activation will become available
          when all required checks are complete.
        </Body>

        <StatusGrid>
          <StatusCard>
            <StatusLabel>Configuration</StatusLabel>
            <StatusValue $tone="ready" data-testid="lb-status-configuration">
              READY
            </StatusValue>
          </StatusCard>
          <StatusCard>
            <StatusLabel>Program Deployment</StatusLabel>
            <StatusValue
              $tone={pillTone(contractsReady)}
              data-testid="lb-ready-contracts"
              data-state={card.readiness.contracts}
            >
              {contractsReady ? 'READY' : 'PENDING'}
            </StatusValue>
          </StatusCard>
          <StatusCard>
            <StatusLabel>Production Activation</StatusLabel>
            <StatusValue
              $tone={activationReady && runtimeReady ? 'ready' : 'pending'}
              data-testid="lb-ready-activation"
              data-state={card.readiness.activation}
            >
              {activationReady && runtimeReady ? 'READY' : 'PENDING'}
            </StatusValue>
          </StatusCard>
        </StatusGrid>
      </Primary>

      <NextCard>
        <NextTitle>What happens next</NextTitle>
        <NextRow>1. Production readiness is monitored automatically.</NextRow>
        <NextRow>2. No transaction will execute before activation.</NextRow>
        <NextRow>3. Your configuration remains available for review.</NextRow>
        <NextRow>
          4. You retain full ownership of deposited assets and resulting LP according to the active
          program state.
        </NextRow>
      </NextCard>

      <Actions>
        <RefreshBtn
          type="button"
          data-testid="lb-refresh-status"
          onClick={() => card.readiness.refresh()}
        >
          <RefreshCw size={16} aria-hidden />
          Refresh Status
        </RefreshBtn>
        <EditBtn type="button" data-testid="lb-edit-configuration" onClick={onEdit}>
          Edit Configuration
        </EditBtn>
      </Actions>
    </Shell>
  )
}
