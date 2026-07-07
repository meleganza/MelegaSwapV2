import React, { useState } from 'react'
import styled from 'styled-components'
import type { PoolPreviewCard } from '../poolsStudioData'
import { poolsStudioColors, poolsStudioLayout } from '../poolsStudioTokens'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { buildPoolMachineV2 } from '../poolsRuntime/formatPoolPresentation'
import { PoolTokenIcon, PsSmallGhostBtn, PsSmallPrimaryBtn } from './poolsStudioPrimitives'

const Wrap = styled.div`
  border: 1px solid ${poolsStudioColors.border};
  border-radius: ${poolsStudioLayout.cardRadius};
  background: ${poolsStudioColors.card};
  overflow: hidden;
  transition: border-color ${poolsStudioLayout.hoverTransition} ease, transform 150ms ease;

  &:hover {
    border-color: ${poolsStudioColors.goldBorder};
    transform: translateY(-2px);
  }
`

const Row = styled.button`
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.8fr) minmax(0, 0.8fr) 40px;
  align-items: center;
  gap: 12px;
  width: 100%;
  height: ${poolsStudioLayout.listRowHeight};
  padding: 0 20px;
  border: none;
  background: transparent;
  color: ${poolsStudioColors.text};
  cursor: pointer;
  text-align: left;
  box-sizing: border-box;
`

const NameCell = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const Name = styled.span`
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Apr = styled.span`
  font-size: 18px;
  font-weight: 800;
  color: ${poolsStudioColors.aprGreen};
`

const Meta = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${poolsStudioColors.secondary};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Chevron = styled.span<{ $open: boolean }>`
  display: inline-flex;
  justify-content: center;
  font-size: 14px;
  color: ${poolsStudioColors.muted};
  transform: rotate(${({ $open }) => ($open ? '90deg' : '0deg')});
  transition: transform ${poolsStudioLayout.drawerTransition} ease;
`

const Expand = styled.div<{ $open: boolean }>`
  overflow: hidden;
  max-height: ${({ $open }) => ($open ? '280px' : '0')};
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transition: max-height ${poolsStudioLayout.drawerTransition} ease, opacity ${poolsStudioLayout.drawerTransition} ease;
  border-top: 1px solid ${poolsStudioColors.rowBorder};
  padding: ${({ $open }) => ($open ? '16px 20px' : '0 20px')};
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 20px;
  font-size: 12px;
  color: ${poolsStudioColors.secondary};

  a,
  button {
    color: ${poolsStudioColors.goldBright};
    font-weight: 700;
    text-decoration: none;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    font-size: 12px;
  }
`

const ExpandLabel = styled.span`
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${poolsStudioColors.muted};
  margin-bottom: 4px;
`

const Actions = styled.div`
  grid-column: span 2;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 4px;
`

interface Props {
  pool: PoolPreviewCard
}

export const PoolListCard: React.FC<Props> = ({ pool }) => {
  const [open, setOpen] = useState(false)
  const [machineOpen, setMachineOpen] = useState(false)
  const { requestModal } = usePoolsRuntime()
  const { chainId } = useActiveChainId()
  const preview = pool.analyzePreview
  const isLive = pool.displayStatus === 'LIVE' && pool.status === 'live'
  const aprText = isLive && pool.apr ? pool.apr : 'ENDED'
  const machineJson = JSON.stringify(buildPoolMachineV2(pool, chainId))

  return (
    <Wrap data-ps-pool-list-row>
      <Row type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <NameCell>
          <PoolTokenIcon symbol={pool.tokens[0] ?? 'MARCO'} size={28} />
          <Name>{pool.name}</Name>
        </NameCell>
        <Apr>{aprText}</Apr>
        <Meta>{pool.rewardBudgetUsd ?? '—'}</Meta>
        <Chevron $open={open}>›</Chevron>
      </Row>
      <Expand $open={open}>
        <div>
          <ExpandLabel>Reward budget</ExpandLabel>
          {pool.rewardBudgetUsd ?? preview?.rewardBudget ?? '—'}
        </div>
        <div>
          <ExpandLabel>Contract</ExpandLabel>
          {preview?.contract ?? preview?.sousChefAddress ?? '—'}
        </div>
        <div>
          <ExpandLabel>APR history</ExpandLabel>
          {preview?.aprHistory ?? '—'}
        </div>
        <div>
          <ExpandLabel>Cooldown</ExpandLabel>
          {pool.cooldown ?? '—'}
        </div>
        <div>
          <ExpandLabel>Estimated duration</ExpandLabel>
          {pool.estimatedDuration ?? preview?.emissionEndEstimate ?? '—'}
        </div>
        <div>
          <ExpandLabel>BscScan</ExpandLabel>
          {preview?.contractExplorerUrl ? (
            <a href={preview.contractExplorerUrl} target="_blank" rel="noopener noreferrer">
              View on BscScan
            </a>
          ) : (
            '—'
          )}
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <button type="button" onClick={() => setMachineOpen((v) => !v)}>
            {machineOpen ? 'Hide Machine JSON' : 'Machine JSON'}
          </button>
          {machineOpen ? (
            <div style={{ marginTop: 8, fontSize: 10, wordBreak: 'break-all' }}>{machineJson}</div>
          ) : null}
        </div>
        {isLive ? (
          <Actions>
            <PsSmallPrimaryBtn type="button" onClick={() => requestModal(pool, 'stake')}>
              Stake
            </PsSmallPrimaryBtn>
            <PsSmallGhostBtn type="button" onClick={() => setOpen(false)}>
              Close
            </PsSmallGhostBtn>
          </Actions>
        ) : null}
      </Expand>
    </Wrap>
  )
}

export default PoolListCard
