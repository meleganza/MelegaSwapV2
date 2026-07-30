/**
 * Compact Featured Pool for Hero right column (not the legacy giant bottom card).
 */
import React from 'react'
import styled from 'styled-components'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { poolBscScanContractUrl, resolvePoolContractAddress } from './poolContractLink'
import { poolsHero } from './poolsHeroTokens'

const Card = styled.aside`
  width: 100%;
  max-width: ${poolsHero.trustBoxW};
  min-width: 0;
  box-sizing: border-box;
  border-radius: 14px;
  border: 1px solid rgba(244, 196, 48, 0.28);
  background: linear-gradient(145deg, rgba(22, 20, 12, 0.98) 0%, rgba(12, 12, 12, 0.98) 100%);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Eyebrow = styled.span`
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #f4c430;
`

const Pair = styled.div`
  font-size: 16px;
  font-weight: 750;
  color: #f6f6f6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Meta = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.62);
`

const Apr = styled.span`
  color: #6ddc8c;
  font-weight: 750;
`

const Badge = styled.span<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 750;
  color: ${({ $active }) => ($active ? '#6ddc8c' : '#ff6b6b')};
  background: ${({ $active }) => ($active ? 'rgba(109,220,140,0.12)' : 'rgba(255,107,107,0.12)')};
`

const Actions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 4px;
`

const Btn = styled.button<{ $primary?: boolean }>`
  appearance: none;
  cursor: pointer;
  flex: 1 1 0;
  min-width: 0;
  min-height: 36px;
  height: 36px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid ${({ $primary }) => ($primary ? 'rgba(244,196,48,0.45)' : 'rgba(255,255,255,0.12)')};
  background: ${({ $primary }) => ($primary ? 'rgba(244,196,48,0.16)' : 'rgba(255,255,255,0.04)')};
  color: ${({ $primary }) => ($primary ? '#f4c430' : '#f5f5f5')};
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
`

const Empty = styled.p`
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
`

export const PoolsHeroFeaturedCompact: React.FC = () => {
  const { featured, requestModal } = usePoolsRuntime()
  if (!featured) {
    return (
      <Card data-testid="pools-hero-featured-compact" data-featured="empty">
        <Eyebrow>Featured Pool</Eyebrow>
        <Empty>No rewarding pool available</Empty>
      </Card>
    )
  }
  const title =
    [featured.stakeToken, featured.rewardToken].filter(Boolean).join(' → ') ||
    featured.tokens?.join(' / ') ||
    'Pool'
  const active = featured.displayStatus !== 'ENDED' && featured.status !== 'ended'
  const contractAddress = resolvePoolContractAddress({
    contractAddress: featured.contractAddress,
    explorerUrl: featured.explorerUrl,
    contractExplorerUrl: featured.analyzePreview?.contractExplorerUrl,
  })
  const contractUrl = poolBscScanContractUrl(contractAddress)

  return (
    <Card data-testid="pools-hero-featured-compact" data-featured="ready">
      <Eyebrow>Featured Pool</Eyebrow>
      <Pair title={title}>{title}</Pair>
      <Meta>
        <Badge $active={active}>{active ? 'Active' : 'Finished'}</Badge>
        {featured.apr ? <Apr>{featured.apr}</Apr> : <span>APR unavailable</span>}
        {featured.tvl ? <span>TVL {featured.tvl}</span> : null}
        {featured.rewardToken ? <span>Earn {featured.rewardToken}</span> : null}
      </Meta>
      <Actions>
        <Btn
          type="button"
          $primary
          data-testid="pools-hero-featured-stake"
          disabled={!active}
          onClick={() => requestModal(featured, 'stake')}
        >
          Stake
        </Btn>
        {contractUrl ? (
          <Btn
            type="button"
            data-testid="pools-hero-featured-view-contract"
            data-ps-view-contract
            onClick={() => window.open(contractUrl, '_blank', 'noopener,noreferrer')}
          >
            BscScan ↗
          </Btn>
        ) : null}
      </Actions>
    </Card>
  )
}

export default PoolsHeroFeaturedCompact
