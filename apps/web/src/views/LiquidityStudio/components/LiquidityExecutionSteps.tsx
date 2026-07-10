import React, { useMemo } from 'react'
import styled from 'styled-components'
import { ApprovalState } from 'hooks/useApproveCallback'
import { liquidityStudioColors, liquidityStudioLayout, liquidityTypography } from '../liquidityStudioTokens'
import { useLiquidityRuntime } from '../liquidityRuntime/LiquidityRuntimeContext'

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${liquidityStudioLayout.executionStepGap};
  margin-top: ${liquidityStudioLayout.executionStepGap};
  margin-bottom: ${liquidityStudioLayout.executionButtonGap};
`

const Step = styled.div<{ $active?: boolean; $done?: boolean }>`
  display: grid;
  grid-template-columns: 22px 1fr;
  gap: 10px;
  align-items: start;
  opacity: ${({ $done, $active }) => ($done ? 0.55 : $active ? 1 : 0.72)};
`

const Dot = styled.span<{ $active?: boolean; $done?: boolean }>`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  color: ${({ $active, $done }) =>
    $done ? liquidityStudioColors.muted : $active ? '#050505' : liquidityStudioColors.muted};
  background: ${({ $active, $done }) =>
    $done
      ? 'rgba(27, 231, 122, 0.12)'
      : $active
        ? `linear-gradient(180deg, #f6d44a 0%, ${liquidityStudioColors.gold} 100%)`
        : 'rgba(255, 255, 255, 0.06)'};
  border: 1px solid
    ${({ $active, $done }) =>
      $done ? liquidityStudioColors.green : $active ? liquidityStudioColors.gold : liquidityStudioColors.border};
`

const StepTitle = styled.span`
  display: block;
  font-size: ${liquidityTypography.stepLabel.size};
  font-weight: 700;
  color: ${liquidityStudioColors.text};
  line-height: ${liquidityTypography.stepLabel.lineHeight};
`

const StepMeta = styled.span`
  display: block;
  margin-top: 2px;
  font-size: 11px;
  color: ${liquidityStudioColors.muted};
  line-height: 1.35;
`

export const LiquidityExecutionSteps: React.FC = () => {
  const { mode, noLiquidity, approvalA, approvalB, phase, account } = useLiquidityRuntime()

  const steps = useMemo(() => {
    if (mode === 'My Positions' || mode === 'Simulation') return []
    if (mode === 'Remove Liquidity') {
      const approveDone = phase !== 'approval_required'
      return [
        { id: 'approve', title: 'Approve', meta: 'Authorize LP token spend', active: phase === 'approval_required', done: approveDone },
        { id: 'remove', title: 'Remove Liquidity', meta: 'Burn LP and receive tokens', active: approveDone && phase === 'ready', done: false },
      ]
    }

    const needsApproval =
      approvalA === ApprovalState.NOT_APPROVED || approvalB === ApprovalState.NOT_APPROVED
    const approveDone =
      approvalA === ApprovalState.APPROVED && approvalB === ApprovalState.APPROVED && Boolean(account)

    if (noLiquidity) {
      return [
        {
          id: 'approve',
          title: 'Approve',
          meta: 'Authorize token spend',
          active: needsApproval && Boolean(account),
          done: approveDone,
        },
        {
          id: 'create',
          title: 'Create Pair',
          meta: 'Initialize pool on Melega DEX',
          active: approveDone && noLiquidity,
          done: false,
        },
        {
          id: 'add',
          title: 'Add Liquidity',
          meta: 'Mint LP tokens to wallet',
          active: false,
          done: false,
        },
      ]
    }

    return [
      {
        id: 'approve',
        title: 'Approve',
        meta: 'Authorize token spend',
        active: needsApproval && Boolean(account),
        done: approveDone,
      },
      {
        id: 'add',
        title: 'Add Liquidity',
        meta: 'Mint LP tokens to wallet',
        active: approveDone && phase === 'ready',
        done: false,
      },
    ]
  }, [mode, noLiquidity, approvalA, approvalB, phase, account])

  if (!steps.length) return null

  return (
    <Stack data-ls-execution-steps aria-label="Liquidity execution steps">
      {steps.map((step, index) => (
        <Step key={step.id} $active={step.active} $done={step.done}>
          <Dot $active={step.active} $done={step.done} aria-hidden>
            {step.done ? '✓' : index + 1}
          </Dot>
          <div>
            <StepTitle>{step.title}</StepTitle>
            <StepMeta>{step.meta}</StepMeta>
          </div>
        </Step>
      ))}
    </Stack>
  )
}

export default LiquidityExecutionSteps
