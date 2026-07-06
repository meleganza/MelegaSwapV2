import React, { useState } from 'react'
import styled from 'styled-components'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { poolsStudioColors, poolsStudioLayout } from '../poolsStudioTokens'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { buildPoolMachineV2 } from '../poolsRuntime/formatPoolPresentation'
import { PsGhostBtn, PsPanel, PsPrimaryBtn, PoolTokenIcon } from './poolsStudioPrimitives'
import FeaturedPoolAllocation from './FeaturedPoolAllocation'

const TypeBadge = styled.span`
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
  grid-template-columns: minmax(0, 65%) minmax(0, 35%);
  gap: 24px;
  min-height: 0;

  @media (max-width: 991px) {
    grid-template-columns: 1fr;
  }
`

const Left = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
`

const Right = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  border-left: 1px solid ${poolsStudioColors.rowBorder};
  padding-left: 24px;

  @media (max-width: 991px) {
    border-left: none;
    padding-left: 0;
    border-top: 1px solid ${poolsStudioColors.rowBorder};
    padding-top: 20px;
  }
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`

const PoolName = styled.h2`
  margin: 0;
  font-family: Orbitron, sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: ${poolsStudioColors.text};
`

const Apr = styled.div`
  font-size: 72px;
  font-weight: 800;
  line-height: 1;
  color: ${poolsStudioColors.green};

  @media (max-width: 767px) {
    font-size: 52px;
  }
`

const DailyReward = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${poolsStudioColors.secondary};
  margin-top: -4px;
`

const Metrics = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
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

const BtnCell = styled.div`
  min-width: 0;

  button {
    width: 100%;
    height: ${poolsStudioLayout.btnHeight};
    min-height: ${poolsStudioLayout.btnHeight};
  }
`

const BtnRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: auto;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`

const ContractRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
`

const ContractBtns = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const ContractLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid ${poolsStudioColors.goldBorder};
  color: ${poolsStudioColors.goldBright};
  font-size: 12px;
  font-weight: 700;
  text-decoration: none;
  transition: border-color 150ms ease;

  &:hover {
    border-color: ${poolsStudioColors.cardBorderHover};
  }
`

const CopyBtn = styled.button`
  height: 40px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid ${poolsStudioColors.border};
  background: transparent;
  color: ${poolsStudioColors.secondary};
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
`

const AnalyzeBlock = styled.div`
  overflow: hidden;
  max-height: ${({ $open }: { $open: boolean }) => ($open ? '320px' : '0')};
  opacity: ${({ $open }: { $open: boolean }) => ($open ? 1 : 0)};
  transition: max-height 220ms ease-out, opacity 220ms ease-out;
  font-size: 12px;
  color: ${poolsStudioColors.muted};
  line-height: 1.6;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 16px;
`

const LoadingLine = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${poolsStudioColors.muted};
`

const MachineHidden = styled.div`
  display: none;
`

export const FeaturedPoolPanel: React.FC = () => {
  const { featured, loadingLabel, requestModal, account } = usePoolsRuntime()
  const card = featured.card
  const [analyzeOpen, setAnalyzeOpen] = useState(false)
  const preview = card?.analyzePreview

  const copyContract = () => {
    if (featured.contractAddress) navigator.clipboard?.writeText(featured.contractAddress)
  }

  return (
    <PsPanel
      data-ps-panel
      data-ps-featured
      $height={poolsStudioLayout.featuredHeight}
      $radius="20px"
      style={{ padding: '24px' }}
    >
      {card ? (
        <MachineHidden data-melega-pool-v2={JSON.stringify(buildPoolMachineV2(card))} aria-hidden />
      ) : null}
      <Inner>
        <Left>
          {loadingLabel ? (
            <LoadingLine>{loadingLabel}</LoadingLine>
          ) : (
            <>
              <TitleRow>
                <PoolTokenIcon symbol={featured.symbol} size={28} />
                <PoolName>{featured.name}</PoolName>
                <TypeBadge>{featured.visualType}</TypeBadge>
              </TitleRow>
              <Apr>{featured.apr}</Apr>
              <DailyReward>{featured.estimatedDailyReward}</DailyReward>
              <Metrics>
                <Metric>
                  <MetricLabel>Stake</MetricLabel>
                  <MetricValue>{featured.stakeToken}</MetricValue>
                </Metric>
                <Metric>
                  <MetricLabel>Reward</MetricLabel>
                  <MetricValue>{featured.rewardToken}</MetricValue>
                </Metric>
                <Metric>
                  <MetricLabel>Pool Type</MetricLabel>
                  <MetricValue>{featured.visualType}</MetricValue>
                </Metric>
                <Metric>
                  <MetricLabel>Lock Period</MetricLabel>
                  <MetricValue>{featured.lockPeriod}</MetricValue>
                </Metric>
                <Metric>
                  <MetricLabel>Cooldown</MetricLabel>
                  <MetricValue>{featured.cooldown}</MetricValue>
                </Metric>
                <Metric>
                  <MetricLabel>Reward Token</MetricLabel>
                  <MetricValue>{featured.rewardToken}</MetricValue>
                </Metric>
                <Metric>
                  <MetricLabel>Total Rewards Remaining</MetricLabel>
                  <MetricValue>{featured.remainingRewards}</MetricValue>
                </Metric>
                <Metric>
                  <MetricLabel>Participants</MetricLabel>
                  <MetricValue>{featured.participants}</MetricValue>
                </Metric>
                <Metric>
                  <MetricLabel>TVL</MetricLabel>
                  <MetricValue>{featured.tvl}</MetricValue>
                </Metric>
              </Metrics>
              <BtnRow>
                <BtnCell>
                  <ConnectWalletButton>Connect Wallet</ConnectWalletButton>
                </BtnCell>
                <PsPrimaryBtn
                  type="button"
                  onClick={() => card && requestModal(card, 'stake')}
                  disabled={!account || !card || card.status === 'ended'}
                  style={{ width: '100%' }}
                >
                  Stake
                </PsPrimaryBtn>
                <PsGhostBtn
                  type="button"
                  onClick={() => setAnalyzeOpen((v) => !v)}
                  disabled={!preview}
                  style={{ width: '100%' }}
                >
                  {analyzeOpen ? 'Hide Analysis' : 'Analyze'}
                </PsGhostBtn>
              </BtnRow>
              {analyzeOpen && preview ? (
                <AnalyzeBlock $open={analyzeOpen}>
                  <div>APR History: {preview.aprHistory}</div>
                  <div>Pool Type: {card?.visualType}</div>
                  <div>Lock: {card?.lockPeriod}</div>
                  <div>Cooldown: {card?.cooldown}</div>
                  <div>Sustainability: {card?.rewardSustainability}</div>
                  <div>Auto Compound: {preview.autoCompound}</div>
                  <div>Contract: {preview.contract}</div>
                </AnalyzeBlock>
              ) : null}
            </>
          )}
        </Left>
        <Right>
          <FeaturedPoolAllocation />
          <ContractRow>
            <MetricLabel>Contract</MetricLabel>
            <MetricValue>{featured.contractLabel}</MetricValue>
            <ContractBtns>
              <ContractLink href={featured.explorerUrl} target="_blank" rel="noopener noreferrer">
                BSC Explorer
              </ContractLink>
              <CopyBtn type="button" onClick={copyContract}>
                Copy address
              </CopyBtn>
              <ContractLink href={featured.explorerUrl} target="_blank" rel="noopener noreferrer">
                View Contract
              </ContractLink>
            </ContractBtns>
          </ContractRow>
        </Right>
      </Inner>
    </PsPanel>
  )
}

export default FeaturedPoolPanel
