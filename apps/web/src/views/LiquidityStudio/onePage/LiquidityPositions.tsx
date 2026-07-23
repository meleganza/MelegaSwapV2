import React, { useMemo } from 'react'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import { Pause, Plus, Settings2, Minus, Eye } from 'lucide-react'
import { useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'
import { selectLiquidityPortfolioPositions } from '../liquidityRuntime/buildLiquidityWalletPortfolio'
import { liqOne } from './onePageTokens'

const Section = styled.section`
  width: 100%;
  margin-top: ${liqOne.sectionGap};
`

const Title = styled.h2`
  margin: 0 0 12px;
  font-size: 18px;
  line-height: 24px;
  font-weight: 700;
  color: ${liqOne.text};
`

const Card = styled.div`
  border: 1px solid ${liqOne.border};
  border-radius: 14px;
  background: ${liqOne.card};
  overflow: hidden;
`

const Table = styled.div`
  display: none;

  @media (min-width: 900px) {
    display: block;
    width: 100%;
    overflow-x: auto;
  }
`

const Head = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1.1fr 0.9fr 0.8fr 0.9fr 0.9fr 0.9fr;
  gap: 8px;
  height: ${liqOne.positionsHeadH};
  min-height: ${liqOne.positionsHeadH};
  max-height: ${liqOne.positionsHeadH};
  padding: 0 16px;
  align-items: center;
  box-sizing: border-box;
  font-size: 11px;
  font-weight: 650;
  color: ${liqOne.muted};
  border-bottom: 1px solid ${liqOne.borderDefault};
  text-transform: uppercase;
  letter-spacing: 0.04em;
  overflow: hidden;
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 1.1fr 0.9fr 0.8fr 0.9fr 0.9fr 0.9fr;
  gap: 8px;
  height: ${liqOne.positionsRowH};
  min-height: ${liqOne.positionsRowH};
  max-height: ${liqOne.positionsRowH};
  padding: 0 16px;
  align-items: center;
  box-sizing: border-box;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  font-size: 13px;
  color: ${liqOne.text};
  overflow: hidden;

  &:last-child {
    border-bottom: none;
  }
`

const MobileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;

  @media (min-width: 900px) {
    display: none;
  }
`

const MobileCard = styled.div`
  border: 1px solid ${liqOne.borderDefault};
  border-radius: 12px;
  background: ${liqOne.elevated};
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const TypePill = styled.span<{ $lb?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 650;
  color: ${({ $lb }) => ($lb ? liqOne.gold : liqOne.secondary)};
`

const Status = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: ${liqOne.positive};
  font-weight: 650;
`

const Dot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: ${liqOne.positive};
`

const Actions = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`

const ActionBtn = styled.button`
  appearance: none;
  cursor: pointer;
  min-width: 36px;
  min-height: 36px;
  border-radius: 8px;
  border: 1px solid ${liqOne.borderStrong};
  background: transparent;
  color: ${liqOne.text};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 650;

  @media (max-width: 899px) {
    min-height: 44px;
    min-width: 44px;
    flex: 1;
  }
`

const Empty = styled.div`
  padding: 20px 16px;
  color: ${liqOne.secondary};
  font-size: 14px;
`

export type LbPositionRow = {
  id: string
  pair: string
  status: string
  value: string
}

type Props = {
  lbPrograms?: LbPositionRow[]
  onManageLb: (programId?: string) => void
  onAddManual: (pairHint?: string) => void
}

export const LiquidityPositions: React.FC<Props> = ({ lbPrograms = [], onManageLb, onAddManual }) => {
  const router = useRouter()
  const { account, positionsLoading, setMode, setSelectedPositionId, positions, liquidityWalletPortfolio } =
    useLiquidityRuntime()

  const manual = useMemo(
    () => selectLiquidityPortfolioPositions(liquidityWalletPortfolio),
    [liquidityWalletPortfolio],
  )

  const rows = [
    ...manual.map((p) => ({
      id: p.positionId,
      pair: p.title,
      type: 'Manual / Add Liquidity',
      value: p.currentValueUsd ? `$${Number(p.currentValueUsd).toLocaleString()}` : '—',
      share: p.poolShare ?? '—',
      fees: p.feesEarnedUsd ? `$${p.feesEarnedUsd}` : '—',
      status: 'Active',
      isLb: false as const,
      contract: p.contract,
    })),
    ...lbPrograms.map((p) => ({
      id: p.id,
      pair: p.pair,
      type: 'Liquidity Building',
      value: p.value,
      share: '—',
      fees: '—',
      status: p.status,
      isLb: true as const,
      contract: null as string | null,
    })),
  ]

  return (
    <Section data-testid="liq-one-positions" id="liq-your-positions">
      <Title>Your Positions</Title>
      <Card>
        {!account ? (
          <Empty>Connect wallet to view liquidity positions.</Empty>
        ) : positionsLoading ? (
          <Empty>Loading positions…</Empty>
        ) : rows.length === 0 ? (
          <Empty data-testid="liq-one-positions-empty">
            No liquidity positions yet. Add liquidity or set up Liquidity Building above.
          </Empty>
        ) : (
          <>
            <Table>
              <Head>
                <span>Pair</span>
                <span>Type</span>
                <span>Value</span>
                <span>Pool Share</span>
                <span>Fees</span>
                <span>Status</span>
                <span>Actions</span>
              </Head>
              {rows.map((r) => (
                <Row key={r.id} data-testid={r.isLb ? 'liq-one-lb-position-row' : 'liq-one-manual-position-row'}>
                  <strong>{r.pair}</strong>
                  <TypePill $lb={r.isLb}>{r.type}</TypePill>
                  <span>{r.value}</span>
                  <span>{r.share}</span>
                  <span>{r.fees}</span>
                  <Status>
                    <Dot />
                    {r.status}
                  </Status>
                  <Actions>
                    {r.isLb ? (
                      <>
                        <ActionBtn type="button" aria-label="View" onClick={() => onManageLb(r.id)}>
                          <Eye size={14} />
                        </ActionBtn>
                        <ActionBtn type="button" aria-label="Manage" onClick={() => onManageLb(r.id)}>
                          <Settings2 size={14} />
                        </ActionBtn>
                        <ActionBtn type="button" aria-label="Pause" disabled title="Available when program is active">
                          <Pause size={14} />
                        </ActionBtn>
                      </>
                    ) : (
                      <>
                        <ActionBtn
                          type="button"
                          aria-label="View"
                          onClick={() => {
                            const hit = positions.find(
                              (p) => p.id.toLowerCase() === (r.contract || '').toLowerCase(),
                            )
                            if (hit) setSelectedPositionId(hit.id)
                          }}
                        >
                          <Eye size={14} />
                        </ActionBtn>
                        <ActionBtn
                          type="button"
                          aria-label="Add"
                          onClick={() => {
                            onAddManual(r.pair)
                            setMode('Add Liquidity')
                            void router.replace(
                              { pathname: '/liquidity-studio', query: { view: 'add' } },
                              undefined,
                              { shallow: true },
                            )
                          }}
                        >
                          <Plus size={14} />
                        </ActionBtn>
                        <ActionBtn
                          type="button"
                          aria-label="Remove"
                          onClick={() => {
                            setMode('Remove Liquidity')
                            void router.replace(
                              { pathname: '/liquidity-studio', query: { view: 'remove' } },
                              undefined,
                              { shallow: true },
                            )
                          }}
                        >
                          <Minus size={14} />
                        </ActionBtn>
                      </>
                    )}
                  </Actions>
                </Row>
              ))}
            </Table>

            <MobileList>
              {rows.map((r) => (
                <MobileCard key={`m-${r.id}`}>
                  <div>
                    <strong style={{ color: liqOne.text }}>{r.pair}</strong>
                    <div style={{ marginTop: 4 }}>
                      <TypePill $lb={r.isLb}>{r.type}</TypePill>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
                    <span>Value: {r.value}</span>
                    <span>Share: {r.share}</span>
                    <span>Fees: {r.fees}</span>
                    <Status>
                      <Dot />
                      {r.status}
                    </Status>
                  </div>
                  <Actions>
                    {r.isLb ? (
                      <ActionBtn type="button" onClick={() => onManageLb(r.id)}>
                        Manage
                      </ActionBtn>
                    ) : (
                      <>
                        <ActionBtn type="button" onClick={() => onAddManual(r.pair)}>
                          Add
                        </ActionBtn>
                        <ActionBtn
                          type="button"
                          onClick={() => {
                            setMode('Remove Liquidity')
                            void router.replace(
                              { pathname: '/liquidity-studio', query: { view: 'remove' } },
                              undefined,
                              { shallow: true },
                            )
                          }}
                        >
                          Remove
                        </ActionBtn>
                      </>
                    )}
                  </Actions>
                </MobileCard>
              ))}
            </MobileList>
          </>
        )}
      </Card>
    </Section>
  )
}

export default LiquidityPositions
