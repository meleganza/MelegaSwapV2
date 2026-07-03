import React from 'react'
import styled from 'styled-components'
import { ASSETS, FARMS, LIQUIDITY, POOLS } from '../commandCenterData'
import { CC_FONT_BODY, commandCenterColors } from '../commandCenterTokens'
import { CcCardHeader, CcGoldBtn, CcOutlineBtn, CcPanel, CcPill, CcTitle, CcViewAll } from './commandCenterPrimitives'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const Col = styled(CcPanel)`
  padding: 18px;
  min-height: 280px;
  display: flex;
  flex-direction: column;
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
`

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-family: ${CC_FONT_BODY};
  font-size: 12px;
`

const Left = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
`

const TokenIcon = styled.span<{ $color: string }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: ${({ $color }) => $color}22;
  border: 1px solid ${({ $color }) => $color}55;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  color: ${({ $color }) => $color};
  flex-shrink: 0;
`

const Change = styled.span<{ $pos: boolean }>`
  font-weight: 700;
  color: ${({ $pos }) => ($pos ? commandCenterColors.green : commandCenterColors.red)};
`

const BtnWrap = styled.div`
  margin-top: 14px;
`

const PairTitle = styled.div`
  font-weight: 700;
  color: ${commandCenterColors.white};
  font-size: 13px;
`

const Meta = styled.div`
  font-size: 11px;
  color: ${commandCenterColors.muted};
  margin-top: 4px;
`

export const PositionColumns: React.FC = () => (
  <Grid data-cc-position-columns>
    <Col>
      <CcCardHeader>
        <CcTitle>Assets</CcTitle>
        <CcViewAll href="/assets">View all</CcViewAll>
      </CcCardHeader>
      <List>
        {ASSETS.map((a) => (
          <Row key={a.id}>
            <Left>
              <TokenIcon $color={a.color}>{a.symbol.slice(0, 1)}</TokenIcon>
              <div>
                <div style={{ fontWeight: 700, color: commandCenterColors.white }}>{a.symbol}</div>
                <div style={{ color: commandCenterColors.muted, fontSize: 11 }}>{a.amount}</div>
              </div>
            </Left>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: commandCenterColors.white }}>{a.usd}</div>
              <Change $pos={a.change24h >= 0}>
                {a.change24h >= 0 ? '+' : ''}
                {a.change24h}%
              </Change>
            </div>
          </Row>
        ))}
      </List>
    </Col>

    <Col>
      <CcCardHeader>
        <CcTitle>Liquidity</CcTitle>
        <CcViewAll href="/liquidity-studio">View all</CcViewAll>
      </CcCardHeader>
      <List>
        {LIQUIDITY.map((l) => (
          <div key={l.id} style={{ padding: '10px 0', borderBottom: `1px solid ${commandCenterColors.border}` }}>
            <PairTitle>{l.pair}</PairTitle>
            <Meta>
              APR {l.apr} · <CcPill $tone="gold">{l.tag}</CcPill>
            </Meta>
            <Meta style={{ color: commandCenterColors.red, marginTop: 6 }}>IL {l.impermanentLoss}</Meta>
          </div>
        ))}
      </List>
      <BtnWrap>
        <CcGoldBtn type="button">Add Liquidity</CcGoldBtn>
      </BtnWrap>
    </Col>

    <Col>
      <CcCardHeader>
        <CcTitle>Pools</CcTitle>
        <CcViewAll href="/pools">View all</CcViewAll>
      </CcCardHeader>
      <List>
        {POOLS.map((p) => (
          <Row key={p.id}>
            <div>
              <PairTitle>{p.name}</PairTitle>
              <Meta>APR {p.apr}</Meta>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Meta>Pending</Meta>
              <div style={{ fontWeight: 700, color: commandCenterColors.green }}>{p.pending}</div>
            </div>
          </Row>
        ))}
      </List>
      <BtnWrap>
        <CcOutlineBtn type="button">Go to Pools</CcOutlineBtn>
      </BtnWrap>
    </Col>

    <Col>
      <CcCardHeader>
        <CcTitle>Farms</CcTitle>
        <CcViewAll href="/farms">View all</CcViewAll>
      </CcCardHeader>
      <List>
        {FARMS.map((f) => (
          <Row key={f.id}>
            <div>
              <PairTitle>{f.name}</PairTitle>
              <Meta>APR {f.apr}</Meta>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Meta>Pending</Meta>
              <div style={{ fontWeight: 700, color: commandCenterColors.green }}>{f.pending}</div>
            </div>
          </Row>
        ))}
      </List>
      <BtnWrap>
        <CcOutlineBtn type="button">Go to Farms</CcOutlineBtn>
      </BtnWrap>
    </Col>
  </Grid>
)

export default PositionColumns
