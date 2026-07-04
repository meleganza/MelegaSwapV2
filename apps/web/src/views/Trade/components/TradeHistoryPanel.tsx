import React from 'react'
import styled from 'styled-components'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { getBlockExploreLink } from 'utils'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { tradeColors } from '../tradeTokens'
import { useTradeHistoryRuntime } from '../tradeRuntime/useTradeHistoryRuntime'
import type { TradeHistoryRowStatus } from '../tradeRuntime/formatTradeHistory'

const Shell = styled.div`
  width: 100%;
  max-width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`

const Panel = styled.div`
  flex: 1;
  padding: 18px;
  background: ${tradeColors.panelGradient};
  border: 1px solid ${tradeColors.border};
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
`

const Title = styled.h2`
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  color: #ffffff;
`

const Sub = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${tradeColors.muted};
`

const SourceBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid ${tradeColors.border};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${tradeColors.goldBright};
`

const Table = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px 12px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.2);
`

const Pair = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
`

const Meta = styled.div`
  font-size: 11px;
  color: ${tradeColors.muted};
  line-height: 1.5;
`

const Right = styled.div`
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
`

const Amount = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #ffffff;
`

const Pill = styled.span<{ $tone?: 'ok' | 'warn' | 'error' | 'muted' }>`
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: ${({ $tone }) =>
    $tone === 'ok' ? '#00e676' : $tone === 'warn' ? tradeColors.goldBright : $tone === 'error' ? '#ff5252' : tradeColors.muted};
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'ok'
        ? 'rgba(0,230,118,0.35)'
        : $tone === 'warn'
          ? 'rgba(244,197,66,0.35)'
          : $tone === 'error'
            ? 'rgba(255,82,82,0.35)'
            : tradeColors.border};
`

const Empty = styled.p`
  margin: 0;
  padding: 24px 0;
  text-align: center;
  font-size: 13px;
  color: ${tradeColors.muted};
`

const ConnectWrap = styled.div`
  margin-top: auto;
  button {
    width: 100% !important;
    height: 44px !important;
    border-radius: 12px !important;
  }
`

function statusTone(status: TradeHistoryRowStatus): 'ok' | 'warn' | 'error' | 'muted' {
  if (status === 'confirmed') return 'ok'
  if (status === 'pending') return 'warn'
  if (status === 'failed') return 'error'
  return 'muted'
}

function settlementTone(label: string): 'ok' | 'warn' | 'error' | 'muted' {
  if (label === 'Settled') return 'ok'
  if (label === 'Settlement Pending' || label === 'Treasury Unavailable' || label === 'Duplicate Settlement') return 'warn'
  if (label === 'Settlement Rejected') return 'error'
  return 'muted'
}

export const TradeHistoryPanel: React.FC = () => {
  const { chainId } = useActiveChainId()
  const { account, rows, emptyLabel, sourceLabel } = useTradeHistoryRuntime()

  return (
    <Shell data-trade-history-panel>
      <Panel>
        <Title>Swap History</Title>
        <Sub>Wallet and protocol swap activity with settlement references when available.</Sub>
        <SourceBadge>{sourceLabel}</SourceBadge>
        <Table>
          {rows.length === 0 ? (
            <Empty>{emptyLabel}</Empty>
          ) : (
            rows.map((row) => {
              const explorer = chainId ? getBlockExploreLink(row.txHash, 'transaction', chainId) : undefined
              return (
                <Row key={row.id} data-trade-history-row>
                  <div>
                    <Pair>{row.pair}</Pair>
                    <Meta>
                      {row.time}
                      {row.received ? ` · Received ${row.received}` : ''}
                      {explorer ? (
                        <>
                          {' · '}
                          <a href={explorer} target="_blank" rel="noreferrer" style={{ color: tradeColors.goldBright }}>
                            {row.txHash.slice(0, 8)}…
                          </a>
                        </>
                      ) : (
                        ` · ${row.txHash.slice(0, 8)}…`
                      )}
                    </Meta>
                    <Meta>Settlement: {row.settlementStatus}</Meta>
                  </div>
                  <Right>
                    <Amount>{row.amount}</Amount>
                    <Pill $tone={statusTone(row.status)}>{row.status}</Pill>
                    <Pill $tone={settlementTone(row.settlementStatus)}>{row.settlementStatus}</Pill>
                  </Right>
                </Row>
              )
            })
          )}
        </Table>
        {!account ? (
          <ConnectWrap>
            <ConnectWalletButton>Connect wallet for your swap history</ConnectWalletButton>
          </ConnectWrap>
        ) : null}
      </Panel>
    </Shell>
  )
}

export default TradeHistoryPanel
