import React from 'react'
import styled from 'styled-components'
import {
  MelegaStudioPageHeader,
  STUDIO_PAGE_TITLES,
} from 'design-system/melega'
import { tradeColors } from '../tradeTokens'

const HowItWorks = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  border: none;
  background: transparent;
  color: #b5b5b5;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    color: #ffffff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const AiModeWrap = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
`

const AiModeLabel = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #b5b5b5;
`

const AiToggle = styled.span<{ $on?: boolean }>`
  position: relative;
  width: 46px;
  height: 24px;
  border-radius: 12px;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: background 150ms ease;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ $on }) => ($on ? '24px' : '2px')};
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: ${({ $on }) => ($on ? tradeColors.goldBright : '#5f5f5f')};
    transition: left 150ms ease, background 150ms ease;
  }
`

const HiddenCheckbox = styled.input`
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
`

export interface TradePageHeaderProps {
  aiMode: boolean
  onAiModeChange: (on: boolean) => void
  onHowItWorks?: () => void
}

export const TradePageHeader: React.FC<TradePageHeaderProps> = ({ aiMode, onAiModeChange, onHowItWorks }) => (
  <MelegaStudioPageHeader
    data-studio-header="trade"
    title={STUDIO_PAGE_TITLES.trade}
    subtitle="Professional trading with best multichain routes."
    actions={
      <>
        <HowItWorks
          type="button"
          onClick={onHowItWorks}
          disabled={!onHowItWorks}
          title={onHowItWorks ? undefined : 'Unavailable'}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          How it works
        </HowItWorks>
        <AiModeWrap>
          <HiddenCheckbox
            type="checkbox"
            checked={aiMode}
            onChange={(e) => onAiModeChange(e.target.checked)}
            aria-label="AI Mode"
          />
          <AiModeLabel>AI Mode</AiModeLabel>
          <AiToggle $on={aiMode} aria-hidden />
        </AiModeWrap>
      </>
    }
  />
)

export default TradePageHeader
