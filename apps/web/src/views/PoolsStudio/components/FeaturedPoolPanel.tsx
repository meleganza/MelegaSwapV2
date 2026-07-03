import React from 'react'
import styled from 'styled-components'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { poolsStudioColors, poolsStudioLayout } from '../poolsStudioTokens'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { PsGhostBtn, PsPanel, PsPrimaryBtn, PoolTokenIcon } from './poolsStudioPrimitives'
import StakeDonutChart from './StakeDonutChart'

const OfficialBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  background: ${poolsStudioColors.goldBg};
  border: 1px solid ${poolsStudioColors.gold};
  color: ${poolsStudioColors.goldBright};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

const Inner = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 20px;
  height: calc(100% - 8px);
  min-height: 0;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    height: auto;
  }
`

const Main = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`

const Apr = styled.div`
  font-size: 56px;
  font-weight: 800;
  line-height: 1;
  color: ${poolsStudioColors.green};
  margin-bottom: ${poolsStudioLayout.featuredAprGap};
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 24px;
  margin-bottom: ${poolsStudioLayout.featuredMetricsBtnGap};
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 8px;
`

const PoolName = styled.h2`
  margin: 0;
  font-family: Orbitron, sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: ${poolsStudioColors.text};
`

const Metric = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const MetricLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${poolsStudioColors.muted};
`

const MetricValue = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: ${poolsStudioColors.text};
`

const BtnRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: auto;
`

const LoadingLine = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${poolsStudioColors.muted};
`

const ConnectWrap = styled.div`
  button {
    height: 40px !important;
    min-height: 40px !important;
    padding: 0 20px !important;
    border-radius: 12px !important;
  }
`

export const FeaturedPoolPanel: React.FC = () => {
  const { featured, loadingLabel, requestModal, account } = usePoolsRuntime()
  const card = featured.card

  return (
    <PsPanel data-ps-panel data-ps-featured $height={poolsStudioLayout.featuredHeight} $radius="22px" style={{ padding: '22px' }}>
      <Inner>
        <Main>
          {loadingLabel ? (
            <LoadingLine>{loadingLabel}</LoadingLine>
          ) : (
            <>
              <TitleRow>
                <PoolTokenIcon symbol={featured.symbol} size={28} />
                <PoolName>{featured.name}</PoolName>
                <OfficialBadge>{featured.poolType}</OfficialBadge>
              </TitleRow>
              <Apr>{featured.apr}</Apr>
              <Metrics>
                <Metric>
                  <MetricLabel>Reward Token</MetricLabel>
                  <MetricValue>{featured.rewardToken}</MetricValue>
                </Metric>
                <Metric>
                  <MetricLabel>Total Staked</MetricLabel>
                  <MetricValue>{featured.totalStaked}</MetricValue>
                </Metric>
                <Metric>
                  <MetricLabel>Lock</MetricLabel>
                  <MetricValue>{featured.lockLabel}</MetricValue>
                </Metric>
                <Metric>
                  <MetricLabel>Participants</MetricLabel>
                  <MetricValue>{featured.participants}</MetricValue>
                </Metric>
                <Metric style={{ gridColumn: 'span 2' }}>
                  <MetricLabel>Rewards Distributed</MetricLabel>
                  <MetricValue>{featured.rewardsDistributed}</MetricValue>
                </Metric>
              </Metrics>
              <BtnRow>
                {card && account ? (
                  <PsPrimaryBtn
                    type="button"
                    style={{ height: 40, minHeight: 40, padding: '0 20px' }}
                    onClick={() => requestModal(card, 'stake')}
                  >
                    Stake
                  </PsPrimaryBtn>
                ) : (
                  <ConnectWrap>
                    <ConnectWalletButton>Connect Wallet</ConnectWalletButton>
                  </ConnectWrap>
                )}
                <PsGhostBtn type="button" style={{ height: 40, minHeight: 40 }}>
                  Analyze
                </PsGhostBtn>
              </BtnRow>
            </>
          )}
        </Main>
        <StakeDonutChart />
      </Inner>
    </PsPanel>
  )
}

export default FeaturedPoolPanel
