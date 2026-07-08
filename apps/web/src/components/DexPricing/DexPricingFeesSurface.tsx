import React from 'react'
import styled from 'styled-components'
import { Text } from '@pancakeswap/uikit'
import {
  FSC_01_POLICY_REF,
  formatServicePricingRows,
  getFsc01Constitution,
  SWAP_PROTOCOL_FEE_BUY_MARCO_BPS,
  SWAP_PROTOCOL_FEE_STANDARD_BPS,
  formatProtocolFeePercent,
} from 'lib/d87-pricing'
import { getSmartRouterReadiness, getMultiChainArchitectureNotes, buildMainnetReadinessMatrix } from 'lib/melega-smart-router'
import { useActiveChainId } from 'hooks/useActiveChainId'

const Root = styled.div`
  color: #f2f2f2;
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const Card = styled.section`
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px 22px;
  background: #101010;
`

const Title = styled.h2`
  margin: 0 0 12px;
  font-size: 18px;
  font-weight: 600;
`

const Table = styled.div`
  display: grid;
  gap: 10px;
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  gap: 12px;
  font-size: 14px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`

const Head = styled(Row)`
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #8f8f8f;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 10px;
`

const Copy = styled(Text)`
  font-size: 13px;
  color: #b8b8b8;
  line-height: 1.5;
`

export function DexPricingFeesSurface() {
  const { chainId } = useActiveChainId()
  const rows = formatServicePricingRows()
  const fsc = getFsc01Constitution()
  const readiness = chainId ? getSmartRouterReadiness(chainId) : null
  const matrix = chainId ? buildMainnetReadinessMatrix(chainId) : []
  const multiChain = getMultiChainArchitectureNotes()

  return (
    <Root data-d87-pricing-fees-surface>
      <Card>
        <Title>Pricing &amp; Fees</Title>
        <Copy mb="12px">
          Melega Smart Router D87 economic layer. LP fees remain separate and are not Civilization
          Revenue.
        </Copy>
        <Table>
          <Head>
            <span>Service</span>
            <span>Standard</span>
            <span>MARCO</span>
          </Head>
          {rows.map((row) => (
            <Row key={row.service}>
              <span>{row.label}</span>
              <span>{row.standard}</span>
              <span>{row.marco}</span>
            </Row>
          ))}
        </Table>
      </Card>

      <Card>
        <Title>Swap / Trading</Title>
        <Copy>
          Standard Protocol Fee: {formatProtocolFeePercent(SWAP_PROTOCOL_FEE_STANDARD_BPS)}
          <br />
          BUY MARCO Protocol Fee: {formatProtocolFeePercent(SWAP_PROTOCOL_FEE_BUY_MARCO_BPS)}
        </Copy>
        <Copy mt="12px">Buying MARCO unlocks the reduced protocol fee.</Copy>
        <Copy mt="8px">
          Protocol Fees are routed to Treasury Runtime under {FSC_01_POLICY_REF}.
        </Copy>
        <Copy mt="8px">LP fees are separate and remain with liquidity providers.</Copy>
        <Copy mt="8px">Referral rewards are always distributed in MARCO.</Copy>
      </Card>

      <Card>
        <Title>FSC-01 Reference (Treasury Runtime)</Title>
        <Copy mb="8px">DEX displays only — Treasury Runtime executes splits.</Copy>
        {fsc.splits.map((split) => (
          <Copy key={split.destination}>
            {split.percent}% {split.label}
          </Copy>
        ))}
      </Card>

      {readiness && (
        <Card>
          <Title>Smart Router Readiness — Chain {readiness.chainId}</Title>
          <Copy>Architecture: {readiness.architecture}</Copy>
          <Copy mt="8px">Ready: {readiness.ready ? 'yes' : 'no'}</Copy>
          {readiness.blockers.length > 0 && (
            <Copy mt="8px" color="#FF9F43">
              Blockers: {readiness.blockers.join(', ')}
            </Copy>
          )}
          <Copy mt="12px" fontSize="12px">
            Collector source: {readiness.collector.source} · MARCO source: {readiness.marco.source}
          </Copy>
        </Card>
      )}

      {matrix.length > 0 && (
        <Card>
          <Title>Mainnet Readiness Matrix</Title>
          {matrix.map((row) => (
            <Copy key={row.id}>
              {row.label}: {row.level} — {row.reason}
            </Copy>
          ))}
        </Card>
      )}

      <Card>
        <Title>Multi-chain Notes</Title>
        <Copy>Phase 1 EVM: {multiChain.evm.phase1.join(', ')}</Copy>
        <Copy mt="8px">Planned EVM: {multiChain.evm.planned.join(', ')}</Copy>
        <Copy mt="8px">{multiChain.solana.note}</Copy>
      </Card>
    </Root>
  )
}

export default DexPricingFeesSurface
