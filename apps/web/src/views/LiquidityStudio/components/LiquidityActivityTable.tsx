import React from 'react'
import styled from 'styled-components'
import { liquidityStudioColors, liquidityStudioLayout, LIQUIDITY_STUDIO_PREVIEW_LABEL } from '../liquidityStudioTokens'

const Wrap = styled.div`
  margin-top: 16px;
  background: ${liquidityStudioColors.panel};
  border: 1px solid ${liquidityStudioColors.border};
  border-radius: ${liquidityStudioLayout.panelRadius};
  padding: ${liquidityStudioLayout.panelPadding};
  box-sizing: border-box;
  overflow-x: auto;
`

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
`

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: ${liquidityStudioColors.text};
`

const Badge = styled.span`
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${liquidityStudioColors.muted};
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 640px;
  font-size: 12px;
`

const Th = styled.th`
  text-align: left;
  padding: 8px 10px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${liquidityStudioColors.muted};
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`

const Td = styled.td`
  padding: 10px;
  color: ${liquidityStudioColors.text};
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  white-space: nowrap;
`

const Status = styled.span`
  color: ${liquidityStudioColors.green};
  font-weight: 700;
`

const ROWS = [
  { time: '2m ago', pair: 'BNB / MARCO', action: 'Add', amount: '1.2 BNB', lp: '842.1 LP', status: 'Indexed' },
  { time: '18m ago', pair: 'MARCO / USDT', action: 'Remove', amount: '4,200 MARCO', lp: '210.0 LP', status: 'Indexed' },
  { time: '1h ago', pair: 'BNB / MARCO', action: 'Add', amount: '0.8 BNB', lp: '561.4 LP', status: 'Preview' },
]

export const LiquidityActivityTable: React.FC = () => (
  <Wrap data-ls-panel data-ls-activity>
    <Head>
      <Title>Liquidity Activity</Title>
      <Badge>{LIQUIDITY_STUDIO_PREVIEW_LABEL}</Badge>
    </Head>
    <Table>
      <thead>
        <tr>
          <Th>Time</Th>
          <Th>Pair</Th>
          <Th>Action</Th>
          <Th>Amount</Th>
          <Th>LP Tokens</Th>
          <Th>Status</Th>
        </tr>
      </thead>
      <tbody>
        {ROWS.map((row) => (
          <tr key={`${row.time}-${row.pair}`}>
            <Td>{row.time}</Td>
            <Td>{row.pair}</Td>
            <Td>{row.action}</Td>
            <Td>{row.amount}</Td>
            <Td>{row.lp}</Td>
            <Td>
              <Status>{row.status}</Status>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  </Wrap>
)

export default LiquidityActivityTable
