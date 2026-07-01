import React from 'react'
import styled from 'styled-components'
import { liquidityStudioColors, liquidityStudioLayout, LIQUIDITY_STUDIO_PREVIEW_LABEL } from '../liquidityStudioTokens'
import { LsPanel, LsPreviewBadge } from './liquidityStudioPrimitives'

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
`

const Title = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  line-height: 1;
  color: ${liquidityStudioColors.text};
`

const TableWrap = styled.div`
  overflow-x: auto;
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
`

const Th = styled.th`
  text-align: left;
  padding: 0 10px 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${liquidityStudioColors.muted};
  border-bottom: 1px solid ${liquidityStudioColors.rowBorder};
`

const Td = styled.td`
  height: 36px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 500;
  color: ${liquidityStudioColors.text};
  border-bottom: 1px solid ${liquidityStudioColors.rowBorder};
  white-space: nowrap;
  vertical-align: middle;
`

const ActionAdd = styled.span`
  color: ${liquidityStudioColors.green};
  font-weight: 700;
`

const ActionRemove = styled.span`
  color: ${liquidityStudioColors.red};
  font-weight: 700;
`

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid ${liquidityStudioColors.gold};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${liquidityStudioColors.goldBright};
`

const ROWS = [
  { time: '2m ago', pair: 'BNB / MARCO', action: 'Add' as const, amount: '1.2 BNB', lp: '842.1 LP' },
  { time: '18m ago', pair: 'MARCO / USDT', action: 'Remove' as const, amount: '4,200 MARCO', lp: '210.0 LP' },
  { time: '1h ago', pair: 'BNB / MARCO', action: 'Add' as const, amount: '0.8 BNB', lp: '561.4 LP' },
]

export const LiquidityActivityTable: React.FC = () => (
  <LsPanel
    data-ls-panel
    data-ls-activity
    $height={liquidityStudioLayout.activityHeight}
    style={{ marginTop: liquidityStudioLayout.verticalRhythm }}
  >
    <Head>
      <Title>Liquidity Activity</Title>
      <LsPreviewBadge style={{ height: 20, padding: '0 8px', fontSize: 9 }}>
        {LIQUIDITY_STUDIO_PREVIEW_LABEL}
      </LsPreviewBadge>
    </Head>
    <TableWrap>
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
            <tr key={`${row.time}-${row.pair}-${row.action}`}>
              <Td>{row.time}</Td>
              <Td>{row.pair}</Td>
              <Td>
                {row.action === 'Add' ? (
                  <ActionAdd>{row.action}</ActionAdd>
                ) : (
                  <ActionRemove>{row.action}</ActionRemove>
                )}
              </Td>
              <Td>{row.amount}</Td>
              <Td>{row.lp}</Td>
              <Td>
                <StatusBadge>Preview Layout</StatusBadge>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableWrap>
  </LsPanel>
)

export default LiquidityActivityTable
