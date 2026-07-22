import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { useRouter } from 'next/router'
import {
  uxRebuildColors,
  uxRebuildFont,
  uxRebuildRadius,
} from 'design-system/melega/tokens/uxRebuild'
import type { LiquidityStudioMode } from '../liquidityRuntime/liquidityStudioView'

const Header = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  font-family: ${uxRebuildFont};
`

const Titles = styled.div`
  min-width: 0;
  flex: 1;
`

const Title = styled.h1`
  margin: 0;
  font-size: 40px;
  line-height: 46px;
  font-weight: 750;
  color: ${uxRebuildColors.text};

  @media (max-width: 767px) {
    font-size: 30px;
    line-height: 36px;
  }
`

const Subtitle = styled.p`
  margin: 8px 0 0;
  max-width: 560px;
  font-size: 14px;
  line-height: 21px;
  color: ${uxRebuildColors.secondary};
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
`

const Primary = styled(Link)`
  height: 42px;
  padding: 0 18px;
  border-radius: 10px;
  background: ${uxRebuildColors.gold};
  color: #080808;
  font-size: 14px;
  font-weight: 650;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  box-shadow: 0 8px 28px rgba(221, 185, 47, 0.14);

  &:hover {
    background: ${uxRebuildColors.goldHover};
  }

  &:focus-visible {
    outline: 2px solid ${uxRebuildColors.gold};
    outline-offset: 2px;
  }
`

const Secondary = styled(Link)`
  height: 42px;
  padding: 0 16px;
  border-radius: 10px;
  border: 1px solid ${uxRebuildColors.borderStrong};
  background: ${uxRebuildColors.card};
  color: ${uxRebuildColors.text};
  font-size: 14px;
  font-weight: 650;
  display: inline-flex;
  align-items: center;
  text-decoration: none;

  &:hover {
    border-color: rgba(221, 185, 47, 0.45);
  }

  &:focus-visible {
    outline: 2px solid ${uxRebuildColors.gold};
    outline-offset: 2px;
  }
`

const SegmentRow = styled.div`
  margin-top: 18px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: ${uxRebuildRadius.input};
  background: ${uxRebuildColors.card};
  border: 1px solid ${uxRebuildColors.border};
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`

const Segment = styled.button<{ $active?: boolean }>`
  flex: 0 0 auto;
  min-height: 40px;
  padding: 0 14px;
  border: none;
  border-radius: 8px;
  background: ${({ $active }) => ($active ? 'rgba(221,185,47,0.14)' : 'transparent')};
  color: ${({ $active }) => ($active ? uxRebuildColors.gold : uxRebuildColors.secondary)};
  font-size: 13px;
  font-weight: ${({ $active }) => ($active ? 700 : 550)};
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    color: ${uxRebuildColors.text};
  }

  &:focus-visible {
    outline: 2px solid ${uxRebuildColors.gold};
    outline-offset: 1px;
  }
`

type SegmentDef = {
  label: string
  testId: string
  view: string
}

const SEGMENT_DEFS: SegmentDef[] = [
  { label: 'Positions', testId: 'ls-seg-positions', view: 'positions' },
  { label: 'Explore', testId: 'ls-seg-explore', view: 'explore' },
  { label: 'Add Liquidity', testId: 'ls-seg-add', view: 'add' },
  { label: 'Liquidity Building', testId: 'ls-seg-building', view: 'building' },
]

function activeSegment(view: unknown, mode: LiquidityStudioMode): string {
  const raw = Array.isArray(view) ? view[0] : view
  const v = typeof raw === 'string' ? raw.trim().toLowerCase() : ''
  if (v === 'explore') return 'ls-seg-explore'
  if (v === 'add' || v === 'add-liquidity') return 'ls-seg-add'
  if (v === 'building' || v === 'liquidity-building') return 'ls-seg-building'
  if (v === 'positions' || v === 'my-positions' || !v) return 'ls-seg-positions'
  if (mode === 'Liquidity Building') return 'ls-seg-building'
  if (mode === 'Add Liquidity') return v === 'explore' ? 'ls-seg-explore' : 'ls-seg-add'
  return 'ls-seg-positions'
}

interface Props {
  mode: LiquidityStudioMode
}

/**
 * Dense Liquidity Studio chrome — Positions / Explore / Add Liquidity / Liquidity Building.
 */
export const LiquidityStudioChrome: React.FC<Props> = ({ mode }) => {
  const router = useRouter()
  const activeId = activeSegment(router.query.view, mode)

  const go = (view: string) => {
    const nextQuery = { ...router.query, view }
    void router.push({ pathname: '/liquidity-studio', query: nextQuery }, undefined, { shallow: true })
  }

  return (
    <div data-testid="ls-studio-chrome" data-ls-chrome>
      <Header>
        <Titles>
          <Title>Liquidity</Title>
          <Subtitle>Manage positions, add liquidity and build project liquidity.</Subtitle>
        </Titles>
        <Actions>
          <Primary href="/liquidity-studio?view=add" data-testid="ls-chrome-add">
            Add Liquidity
          </Primary>
          <Secondary href="/liquidity-studio?view=building" data-testid="ls-chrome-building">
            Start Liquidity Building
          </Secondary>
        </Actions>
      </Header>

      <SegmentRow role="tablist" aria-label="Liquidity Studio sections" data-testid="ls-mode-tabs">
        {SEGMENT_DEFS.map((seg) => (
          <Segment
            key={seg.testId}
            type="button"
            role="tab"
            aria-selected={activeId === seg.testId}
            $active={activeId === seg.testId}
            data-testid={seg.testId}
            onClick={() => go(seg.view)}
          >
            {seg.label}
          </Segment>
        ))}
      </SegmentRow>
    </div>
  )
}

export default LiquidityStudioChrome
