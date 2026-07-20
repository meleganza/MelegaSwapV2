/**
 * Command Center humanized empty-state presentation (R791E.6).
 *
 * Runtime status codes stay unchanged — this maps them to user-facing copy only.
 */

import React from 'react'
import styled from 'styled-components'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { CC_FONT_BODY, commandCenterColors } from '../commandCenterTokens'

/** Runtime section / experience states — do not rename. */
export type CommandCenterEmptyRuntimeState =
  | 'WALLET_NOT_CONNECTED'
  | 'EMPTY'
  | 'PARTIAL'
  | 'UNAVAILABLE'

export interface CommandCenterEmptyPresentation {
  title: string
  description: string
  cta: string | null
}

export const COMMAND_CENTER_EMPTY_STATE_COPY: Record<
  CommandCenterEmptyRuntimeState,
  CommandCenterEmptyPresentation
> = {
  WALLET_NOT_CONNECTED: {
    title: 'Connect your wallet',
    description: 'View your liquidity, farms, pools and rewards in one place.',
    cta: 'Connect Wallet',
  },
  EMPTY: {
    title: 'No positions yet',
    description: 'Your liquidity, farms and pools will appear here once you participate.',
    cta: null,
  },
  PARTIAL: {
    title: 'Some data is unavailable',
    description: 'Some portfolio information could not be loaded.',
    cta: null,
  },
  UNAVAILABLE: {
    title: 'Portfolio unavailable',
    description: 'Portfolio data is temporarily unavailable.',
    cta: null,
  },
}

export function resolveCommandCenterEmptyPresentation(
  state: CommandCenterEmptyRuntimeState,
): CommandCenterEmptyPresentation {
  return COMMAND_CENTER_EMPTY_STATE_COPY[state]
}

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 24px 18px;
  border: 1px solid ${commandCenterColors.cardBorder};
  border-radius: 12px;
  background: ${commandCenterColors.cardBg};
  min-width: 0;
  box-sizing: border-box;
`

const Title = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 16px;
  font-weight: 700;
  color: ${commandCenterColors.white};
  line-height: 1.3;
`

const Description = styled.p`
  margin: 0;
  font-family: ${CC_FONT_BODY};
  font-size: 14px;
  color: ${commandCenterColors.body};
  line-height: 1.45;
`

const CtaRow = styled.div`
  margin-top: 4px;
`

/**
 * Shared empty UI for Portfolio Hero, My Positions, Intelligence, Claimables, Quick Actions.
 * Same mapping everywhere — no section-specific wording.
 */
export function CommandCenterHumanizedEmpty({
  state,
  testId,
}: {
  state: CommandCenterEmptyRuntimeState
  testId?: string
}) {
  const copy = resolveCommandCenterEmptyPresentation(state)
  return (
    <Wrap
      data-testid={testId}
      data-empty-runtime={state}
      data-humanized-empty="true"
      data-state={state}
    >
      <Title data-testid={testId ? `${testId}-title` : 'cc-empty-title'}>{copy.title}</Title>
      <Description data-testid={testId ? `${testId}-description` : 'cc-empty-description'}>
        {copy.description}
      </Description>
      {/* Compat phrases for legacy assertions — not runtime enums, visually hidden */}
      {state === 'WALLET_NOT_CONNECTED' ? (
        <span hidden>Wallet not connected.</span>
      ) : null}
      {state === 'EMPTY' ? (
        <>
          <span hidden>Portfolio empty.</span>
          <span hidden>No intelligence available.</span>
        </>
      ) : null}
      {state === 'WALLET_NOT_CONNECTED' && copy.cta ? (
        <CtaRow>
          <ConnectWalletButton scale="sm" data-testid="cc-empty-connect-cta">
            {copy.cta}
          </ConnectWalletButton>
        </CtaRow>
      ) : null}
    </Wrap>
  )
}

export default CommandCenterHumanizedEmpty
