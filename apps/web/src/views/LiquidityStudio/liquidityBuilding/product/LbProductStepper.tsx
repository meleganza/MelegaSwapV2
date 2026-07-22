import React from 'react'
import styled from 'styled-components'
import { Check } from 'lucide-react'
import type { LbUxPhase } from '../liquidityBuildingStep'
import { stepperIndexForPhase } from '../liquidityBuildingStep'
import { lb } from './lbProductTokens'

const Wrap = styled.nav`
  width: 100%;
  height: 72px;
  margin-bottom: 24px;
  padding: 0 24px;
  border-radius: 16px;
  background: ${lb.cardDeep};
  border: 1px solid #252525;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: center;
  position: relative;
  box-sizing: border-box;

  @media (max-width: 768px) {
    height: auto;
    min-height: 70px;
    padding: 14px;
    grid-template-columns: repeat(4, minmax(90px, 1fr));
    overflow-x: auto;
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }
`

const Connector = styled.div<{ $progress: number }>`
  position: absolute;
  left: 64px;
  right: 64px;
  top: 35px;
  height: 1px;
  background: #2a2a2a;
  z-index: 1;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    height: 1px;
    width: ${({ $progress }) => `${Math.min(100, Math.max(0, $progress))}%`};
    background: rgba(244, 196, 48, 0.48);
  }

  @media (max-width: 768px) {
    display: none;
  }
`

const Step = styled.button<{ $clickable?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  z-index: 2;
  border: 0;
  background: transparent;
  padding: 0;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  text-align: left;
  font-family: ${lb.font};
`

const Indicator = styled.span<{ $state: 'inactive' | 'current' | 'completed' }>`
  width: 28px;
  height: 28px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  line-height: 14px;
  font-weight: 700;
  flex-shrink: 0;
  ${({ $state }) =>
    $state === 'current'
      ? `border:1px solid ${lb.gold};background:${lb.gold};color:${lb.ink};`
      : $state === 'completed'
        ? `border:1px solid ${lb.gold};background:rgba(244,196,48,0.12);color:${lb.gold};`
        : `border:1px solid #383838;background:#151515;color:#7A7A7A;`}
`

const Label = styled.span<{ $state: 'inactive' | 'current' | 'completed' }>`
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  color: ${({ $state }) =>
    $state === 'current' ? lb.text : $state === 'completed' ? '#D4D4D4' : lb.muted7};
`

const STEPS = ['Configure', 'Review', 'Activate', 'Build'] as const

export function LbProductStepper({
  phase,
  onNavigate,
}: {
  phase: LbUxPhase
  onNavigate?: (target: LbUxPhase) => void
}) {
  const current = stepperIndexForPhase(phase)

  return (
    <Wrap data-testid="lb-product-stepper" aria-label="Liquidity Building progress">
      <Connector $progress={current === 0 ? 0 : (current / 3) * 100} />
      {STEPS.map((label, index) => {
        const state =
          index < current ? 'completed' : index === current ? 'current' : 'inactive'
        const clickable = state === 'completed' && Boolean(onNavigate)
        const targetPhase: LbUxPhase | null =
          index === 0 ? 'setup' : index === 1 ? 'review' : null
        return (
          <Step
            key={label}
            type="button"
            $clickable={clickable && targetPhase != null}
            disabled={!clickable || targetPhase == null}
            data-testid={`lb-stepper-${index}`}
            data-state={state}
            onClick={() => {
              if (clickable && targetPhase && onNavigate) onNavigate(targetPhase)
            }}
          >
            <Indicator $state={state}>
              {state === 'completed' ? <Check size={14} strokeWidth={2} /> : index + 1}
            </Indicator>
            <Label $state={state}>{label}</Label>
          </Step>
        )
      })}
    </Wrap>
  )
}
