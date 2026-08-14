/**
 * Uniform wallet flow status strip — connect / switch / approve / confirm / success / error.
 */
import React from 'react'
import styled from 'styled-components'
import { walletFlowMessage, type WalletFlowStage } from 'lib/monetization/copy'

const Strip = styled.div<{ $stage: WalletFlowStage }>`
  margin: 0;
  padding: 8px 10px;
  border-radius: 10px;
  font-size: 12px;
  line-height: 1.35;
  border: 1px solid
    ${({ $stage }) =>
      $stage === 'error'
        ? 'rgba(255, 120, 120, 0.4)'
        : $stage === 'success'
          ? 'rgba(80, 200, 120, 0.4)'
          : 'rgba(255, 255, 255, 0.12)'};
  background: ${({ $stage }) =>
    $stage === 'error'
      ? 'rgba(80, 20, 20, 0.45)'
      : $stage === 'success'
        ? 'rgba(20, 60, 40, 0.45)'
        : 'rgba(255, 255, 255, 0.04)'};
  color: ${({ $stage }) => ($stage === 'error' ? '#ffb0b0' : '#e8e8e8')};
`

export const WalletFlowStatus: React.FC<{
  stage: WalletFlowStage
  detail?: string
  testId?: string
}> = ({ stage, detail, testId = 'wallet-flow-status' }) => {
  if (stage === 'idle') return null
  const msg = walletFlowMessage(stage, detail)
  if (!msg) return null
  return (
    <Strip $stage={stage} data-testid={testId} data-wallet-stage={stage} role="status">
      {msg}
    </Strip>
  )
}

export default WalletFlowStatus
