/**
 * Featured Pool band — highest-TVL active SmartChef pool (factual).
 */
import React from 'react'
import styled from 'styled-components'
import { typography } from 'design-system/melega'
import { PoolTokenIcon } from '../components/poolsStudioPrimitives'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { poolBscScanContractUrl, resolvePoolContractAddress } from './poolContractLink'
import { poolsHero } from './poolsHeroTokens'

const Band = styled.section`
  width: 100%;
  max-width: ${poolsHero.contentMax};
  box-sizing: border-box;
  border-radius: 12px;
  border: 1px solid rgba(244, 196, 48, 0.28);
  background: linear-gradient(145deg, rgba(22, 20, 12, 0.98) 0%, rgba(12, 12, 12, 0.98) 100%);
  padding: 10px 12px;
  display: grid;
  grid-template-columns: auto minmax(0, 1.4fr) repeat(4, minmax(0, 0.7fr)) auto;
  gap: 8px 10px;
  align-items: center;
  font-family: ${typography.fontFamily.body};
  min-width: 0;
  max-height: 120px;

  @media (max-width: 1199px) {
    grid-template-columns: auto minmax(0, 1fr) 1fr 1fr;
    max-height: none;
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr 1fr;
    padding: 10px;
    max-height: none;
  }
`

const Eyebrow = styled.div`
  grid-column: 1 / -1;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #f4c430;
`

const Logos = styled.div`
  display: flex;
  align-items: center;
`

const RewardWrap = styled.span`
  margin-left: -8px;
  position: relative;
  z-index: 1;
  display: inline-flex;
`

const Title = styled.div`
  min-width: 0;
  font-size: 16px;
  font-weight: 750;
  color: #f6f6f6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Sub = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
  margin-top: 2px;
`

const Metric = styled.div`
  min-width: 0;
`

const Label = styled.div`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
`

const Value = styled.div`
  font-size: 14px;
  font-weight: 750;
  color: #f5f5f5;
  margin-top: 2px;
`

const Apr = styled(Value)`
  color: #6ddc8c;
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;

  @media (max-width: 767px) {
    grid-column: 1 / -1;
    justify-content: stretch;
  }
`

const Btn = styled.button<{ $primary?: boolean }>`
  min-height: 34px;
  height: 34px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid
    ${({ $primary }) => ($primary ? 'rgba(244,196,48,0.45)' : 'rgba(255,255,255,0.12)')};
  background: ${({ $primary }) => ($primary ? 'rgba(244,196,48,0.16)' : 'rgba(255,255,255,0.04)')};
  color: ${({ $primary }) => ($primary ? '#F4C430' : '#F5F5F5')};
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const Empty = styled.p`
  grid-column: 1 / -1;
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
`

export const PoolsFeaturedPoolBand: React.FC = () => {
  const { featured, requestModal } = usePoolsRuntime()
  const card = featured?.card

  if (!card || !featured) {
    return (
      <Band data-testid="pools-featured-band" data-featured="empty">
        <Eyebrow>Featured Pool</Eyebrow>
        <Empty>No active pool with measurable TVL is available yet.</Empty>
      </Band>
    )
  }

  const contractAddress = resolvePoolContractAddress({
    contractAddress: card.contractAddress,
    explorerUrl: card.explorerUrl,
    contractExplorerUrl: card.analyzePreview?.contractExplorerUrl,
  })
  const contractUrl = poolBscScanContractUrl(contractAddress)
  const stakeEnabled = card.cta === 'stake' || card.status === 'live'

  return (
    <Band data-testid="pools-featured-band" data-featured="ready" data-pool-id={card.id}>
      <Eyebrow>Featured Pool · Highest TVL active</Eyebrow>
      <Logos aria-hidden="true">
        <PoolTokenIcon
          symbol={featured.stakeToken}
          address={card.stakeContractAddress ?? undefined}
          size={36}
        />
        <RewardWrap>
          <PoolTokenIcon
            symbol={featured.rewardToken}
            address={card.rewardContractAddress ?? undefined}
            size={28}
          />
        </RewardWrap>
      </Logos>
      <div>
        <Title>
          {featured.stakeToken} → {featured.rewardToken}
        </Title>
        <Sub>{featured.name}</Sub>
      </div>
      <Metric>
        <Label>APR</Label>
        <Apr>{featured.apr && featured.apr !== '—' ? featured.apr : '—'}</Apr>
      </Metric>
      <Metric>
        <Label>TVL</Label>
        <Value>{featured.tvl || '—'}</Value>
      </Metric>
      <Metric>
        <Label>Participants</Label>
        <Value>{featured.participants || '—'}</Value>
      </Metric>
      <Metric>
        <Label>Reward</Label>
        <Value>{featured.rewardToken || '—'}</Value>
      </Metric>
      <Actions>
        <Btn
          type="button"
          $primary
          disabled={!stakeEnabled}
          aria-label={`Stake in featured pool ${featured.name}`}
          onClick={() => {
            if (!stakeEnabled) return
            requestModal(card, 'stake')
          }}
        >
          Stake
        </Btn>
        {contractUrl ? (
          <Btn
            type="button"
            data-testid="pools-featured-view-contract"
            data-ps-view-contract
            aria-label={`View contract for ${featured.name} on BscScan`}
            onClick={() => window.open(contractUrl, '_blank', 'noopener,noreferrer')}
          >
            View Contract ↗
          </Btn>
        ) : null}
      </Actions>
    </Band>
  )
}

export default PoolsFeaturedPoolBand
