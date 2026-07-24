/**
 * PASSPORT_MODULE_005 — Liquidity Positions (desktop min 1376×232).
 * Summarizes factual positions; routes management to Liquidity Studio.
 */
import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { passportOne } from './passportTokens'
import {
  PassportLiquidityDesktopRow,
  PassportLiquidityMobileCard,
} from './PassportLiquidityRow'
import {
  usePassportLiquidityPositions,
  type UsePassportLiquidityPositionsOptions,
} from './usePassportLiquidityPositions'
import { passportLiquidityModuleHeightPx } from './buildPassportLiquidityPositionsViewModel'
import type { PassportLiquidityPositionsViewModel } from './passportLiquidityTypes'

const Module = styled.section<{ $height: number }>`
  position: relative;
  width: 100%;
  max-width: ${passportOne.contentMax};
  height: ${({ $height }) => $height}px;
  min-height: ${passportOne.liquidityMinH};
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: linear-gradient(145deg, rgba(17, 17, 17, 0.99) 0%, rgba(12, 12, 12, 0.99) 100%);
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.03);
  font-family: ${passportOne.font};
  color: ${passportOne.text};

  @media (max-width: 1199px) {
    height: auto;
    min-height: 0;
    overflow: visible;
  }

  @media (max-width: 767px) {
    width: 100%;
    max-width: none;
    height: auto;
    padding: 0;
    border-radius: 16px;
  }

  @media (prefers-reduced-motion: reduce) {
    * {
      animation: none !important;
      transition: none !important;
    }
  }
`

const Header = styled.header`
  height: 64px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-sizing: border-box;
`

const HeaderLeft = styled.div`
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
`

const Title = styled.h2`
  margin: 0;
  font-size: 16px;
  line-height: 22px;
  font-weight: 750;
  color: ${passportOne.text};
`

const Count = styled.span`
  font-size: 11px;
  line-height: 14px;
  font-weight: 600;
  color: ${passportOne.muted};
`

const ViewAll = styled(Link)`
  width: 76px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 9px;
  border: 1px solid ${passportOne.borderStrong};
  background: ${passportOne.elevated};
  color: ${passportOne.text};
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  white-space: nowrap;
  padding: 0 6px;
  box-sizing: border-box;

  &[data-wide='true'] {
    width: auto;
    min-width: 76px;
    padding: 0 12px;
  }

  &:focus-visible {
    outline: 2px solid ${passportOne.gold};
    outline-offset: 2px;
  }
`

const TableWrap = styled.div`
  width: 1336px;
  max-width: calc(100% - 40px);
  margin: 0 20px;
  box-sizing: border-box;

  @media (max-width: 1199px) {
    width: auto;
    max-width: none;
    margin: 0 16px 16px;
    overflow-x: auto;
  }

  @media (max-width: 767px) {
    display: none;
  }
`

const Table = styled.table`
  width: 1336px;
  border-collapse: collapse;
  table-layout: fixed;

  @media (max-width: 1199px) {
    width: 100%;
    min-width: 900px;
  }
`

const Thead = styled.thead`
  tr {
    height: 48px;
  }
  th {
    text-align: left;
    font-size: 10px;
    line-height: 14px;
    font-weight: 650;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: ${passportOne.muted};
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    padding: 0 8px;
    box-sizing: border-box;
  }
  th:first-child {
    padding-left: 0;
    width: 300px;
  }
`

const Empty = styled.div`
  height: calc(232px - 64px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 20px 16px;
  box-sizing: border-box;

  @media (max-width: 767px) {
    height: auto;
    padding: 24px 16px;
  }
`

const IconTile = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  border: 1px solid rgba(221, 185, 47, 0.35);
  background: rgba(221, 185, 47, 0.08);
  color: ${passportOne.gold};
  font-size: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
`

const EmptyTitle = styled.div`
  font-size: 15px;
  line-height: 20px;
  font-weight: 750;
  color: ${passportOne.text};
`

const EmptyDesc = styled.p`
  margin: 6px 0 14px;
  max-width: 420px;
  font-size: 12px;
  line-height: 17px;
  color: ${passportOne.secondary};
`

const EmptyActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
`

const PrimaryBtn = styled(Link)`
  width: 132px;
  height: 40px;
  border-radius: 9px;
  border: 1px solid rgba(221, 185, 47, 0.55);
  background: linear-gradient(180deg, #e8ca57 0%, #ddb92f 100%);
  color: #090909;
  font-size: 12px;
  font-weight: 750;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${passportOne.gold};
    outline-offset: 2px;
  }
`

const SecondaryBtn = styled(Link)`
  width: 176px;
  height: 40px;
  border-radius: 9px;
  border: 1px solid ${passportOne.borderStrong};
  background: ${passportOne.elevated};
  color: ${passportOne.text};
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid ${passportOne.gold};
    outline-offset: 2px;
  }
`

const Disconnect = styled.div`
  height: calc(232px - 64px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 0 20px 16px;
  text-align: center;

  @media (max-width: 767px) {
    height: auto;
    padding: 28px 16px;
  }
`

const DisconnectTitle = styled.div`
  font-size: 15px;
  line-height: 20px;
  font-weight: 750;
  max-width: 360px;
`

const MobileList = styled.div`
  display: none;

  @media (max-width: 767px) {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0 16px 16px;
    align-items: center;
  }
`

const MobileViewAll = styled(Link)`
  display: none;

  @media (max-width: 767px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 326px;
    max-width: 100%;
    height: 40px;
    border-radius: 9px;
    border: 1px solid ${passportOne.borderStrong};
    background: ${passportOne.elevated};
    color: ${passportOne.text};
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
  }
`

const TabletNote = styled.div`
  display: none;
  @media (min-width: 768px) and (max-width: 1199px) {
    display: block;
  }
`

export type PassportLiquidityProps = UsePassportLiquidityPositionsOptions & {
  model?: PassportLiquidityPositionsViewModel
}

export const PassportLiquidity: React.FC<PassportLiquidityProps> = ({
  model: injected,
  fixturePositions,
  forceDisconnected,
}) => {
  const live = usePassportLiquidityPositions({ fixturePositions, forceDisconnected })
  const model = injected ?? live
  const empty = model.walletConnected && model.totalCount === 0
  const disconnected = !model.walletConnected
  const height = passportLiquidityModuleHeightPx(
    model.visiblePositions.length,
    empty || disconnected,
  )

  return (
    <Module
      $height={height}
      data-testid="passport-liquidity-module"
      data-passport-module="005"
      data-pixel-passport-liquidity="1376x232"
      data-liquidity-empty={empty ? 'true' : 'false'}
      data-liquidity-disconnected={disconnected ? 'true' : 'false'}
      data-liquidity-count={String(model.totalCount)}
      aria-label="Liquidity Positions"
    >
      <Header data-testid="passport-liquidity-header">
        <HeaderLeft>
          <Title>Liquidity Positions</Title>
          {model.walletConnected && model.totalCount > 0 ? (
            <Count data-testid="passport-liquidity-count">
              {model.totalCount} {model.totalCount === 1 ? 'position' : 'positions'}
            </Count>
          ) : null}
        </HeaderLeft>
        {!disconnected ? (
          <ViewAll
            href={model.viewAllHref}
            data-testid="passport-liquidity-view-all"
            data-wide={model.viewAllLabel !== 'View All' ? 'true' : 'false'}
          >
            {model.viewAllLabel}
          </ViewAll>
        ) : null}
      </Header>

      {disconnected ? (
        <Disconnect data-testid="passport-liquidity-disconnected">
          <DisconnectTitle>Connect your wallet to view liquidity positions</DisconnectTitle>
          <ConnectWalletButton>Connect Wallet</ConnectWalletButton>
        </Disconnect>
      ) : empty ? (
        <Empty data-testid="passport-liquidity-empty">
          <IconTile aria-hidden="true">◈</IconTile>
          <EmptyTitle>No liquidity positions yet</EmptyTitle>
          <EmptyDesc>
            Add liquidity manually or use Liquidity Building to grow project liquidity progressively.
          </EmptyDesc>
          <EmptyActions>
            <PrimaryBtn href={model.emptyAddHref} data-testid="passport-liquidity-add">
              Add Liquidity
            </PrimaryBtn>
            <SecondaryBtn href={model.emptyBuildingHref} data-testid="passport-liquidity-building">
              Start Liquidity Building
            </SecondaryBtn>
          </EmptyActions>
        </Empty>
      ) : (
        <>
          <TableWrap data-testid="passport-liquidity-table-wrap">
            <Table data-testid="passport-liquidity-table">
              <Thead>
                <tr>
                  <th scope="col">Pair</th>
                  <th scope="col" style={{ width: 160 }}>
                    Type
                  </th>
                  <th scope="col" style={{ width: 180 }}>
                    Estimated Value
                  </th>
                  <th scope="col" style={{ width: 180 }}>
                    Your Share
                  </th>
                  <th scope="col" style={{ width: 180 }}>
                    Fees / Rewards
                  </th>
                  <th scope="col" style={{ width: 156 }}>
                    Status
                  </th>
                  <th scope="col" style={{ width: 180 }}>
                    Action
                  </th>
                </tr>
              </Thead>
              <tbody>
                {model.visiblePositions.map((p) => (
                  <PassportLiquidityDesktopRow key={p.id} position={p} />
                ))}
              </tbody>
            </Table>
            <TabletNote />
          </TableWrap>
          <MobileList data-testid="passport-liquidity-mobile-list">
            {model.visiblePositions.map((p) => (
              <PassportLiquidityMobileCard key={p.id} position={p} />
            ))}
            {model.hasMore ? (
              <MobileViewAll href={model.viewAllHref}>View All</MobileViewAll>
            ) : null}
          </MobileList>
        </>
      )}
    </Module>
  )
}

export default PassportLiquidity
