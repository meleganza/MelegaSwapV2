import styled, { keyframes } from 'styled-components'
import {
  CC_FONT_BODY,
  CC_FONT_DISPLAY,
  commandCenterColors,
  commandCenterLayout,
  commandCenterType,
} from '../../commandCenterTokens'

export const SpecCard = styled.section`
  width: 100%;
  background: ${commandCenterColors.cardBg};
  border: 1px solid ${commandCenterColors.cardBorder};
  border-radius: ${commandCenterLayout.cardRadius};
  box-sizing: border-box;
  transition: border-color ${commandCenterColors.transition} ease;

  &:hover {
    border-color: ${commandCenterColors.cardBorderHover};
  }
`

export const SectionHeading = styled.h2`
  margin: 0 0 12px;
  font-family: ${CC_FONT_DISPLAY};
  font-size: ${commandCenterType.sectionTitle};
  font-weight: 700;
  line-height: ${commandCenterType.lineHeight};
  color: ${commandCenterColors.white};
`

export const SpecLabel = styled.span`
  font-family: ${CC_FONT_BODY};
  font-size: ${commandCenterType.label};
  font-weight: 500;
  line-height: ${commandCenterType.lineHeight};
  color: ${commandCenterColors.label};
`

export const SpecMetric = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: ${commandCenterType.metric};
  font-weight: 700;
  line-height: 1.1;
  color: ${commandCenterColors.white};
`

export const SpecDesc = styled.p`
  margin: 0;
  font-family: ${CC_FONT_BODY};
  font-size: ${commandCenterType.description};
  font-weight: 400;
  line-height: ${commandCenterType.lineHeight};
  color: ${commandCenterColors.body};
`

export const SpecDelta = styled.span<{ $positive?: boolean }>`
  font-family: ${CC_FONT_BODY};
  font-size: 14px;
  font-weight: 400;
  color: ${({ $positive }) => ($positive ? commandCenterColors.green : commandCenterColors.portfolioHint)};
`

export const SpecPrimaryBtn = styled.button<{ $disabled?: boolean }>`
  height: 44px;
  padding: 0 18px;
  border: none;
  border-radius: 12px;
  background: ${commandCenterColors.gold};
  color: #050505;
  font-family: ${CC_FONT_BODY};
  font-size: 13px;
  font-weight: 700;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.45 : 1)};
  transition: opacity ${commandCenterColors.transition} ease;
`

export const SpecSecondaryBtn = styled.button<{ $disabled?: boolean }>`
  height: 44px;
  padding: 0 18px;
  border-radius: 12px;
  border: 1px solid ${commandCenterColors.gold};
  background: transparent;
  color: ${commandCenterColors.gold};
  font-family: ${CC_FONT_BODY};
  font-size: 13px;
  font-weight: 700;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.45 : 1)};
`

export const SpecGhostBtn = styled.button`
  height: 44px;
  padding: 0 12px;
  border: none;
  background: transparent;
  color: ${commandCenterColors.gold};
  font-family: ${CC_FONT_BODY};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
`

export const SpecTreasuryGhostBtn = styled.button<{ $disabled?: boolean }>`
  width: 150px;
  height: 40px;
  padding: 0 12px;
  border: none;
  background: transparent;
  color: ${commandCenterColors.gold};
  font-family: ${CC_FONT_BODY};
  font-size: 13px;
  font-weight: 600;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.45 : 1)};
`

export const StatusBadge = styled.span<{ $tone: 'green' | 'yellow' | 'gray' }>`
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-family: ${CC_FONT_BODY};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ $tone }) =>
    $tone === 'green'
      ? commandCenterColors.green
      : $tone === 'yellow'
        ? commandCenterColors.yellow
        : commandCenterColors.gray};
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'green'
        ? 'rgba(27,231,122,0.45)'
        : $tone === 'yellow'
          ? 'rgba(244,197,66,0.45)'
          : 'rgba(111,111,111,0.45)'};
  background: ${({ $tone }) =>
    $tone === 'green'
      ? 'rgba(27,231,122,0.08)'
      : $tone === 'yellow'
        ? 'rgba(244,197,66,0.08)'
        : 'rgba(111,111,111,0.08)'};
`

export const InfraStatusPill = styled.span<{ $tone: 'green' | 'yellow' | 'gray' }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 110px;
  height: 28px;
  border-radius: 14px;
  font-family: ${CC_FONT_BODY};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ $tone }) =>
    $tone === 'green'
      ? commandCenterColors.green
      : $tone === 'yellow'
        ? commandCenterColors.yellow
        : commandCenterColors.gray};
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'green'
        ? 'rgba(27,231,122,0.45)'
        : $tone === 'yellow'
          ? 'rgba(244,197,66,0.45)'
          : 'rgba(111,111,111,0.45)'};
  background: ${({ $tone }) =>
    $tone === 'green'
      ? 'rgba(27,231,122,0.08)'
      : $tone === 'yellow'
        ? 'rgba(244,197,66,0.08)'
        : 'rgba(111,111,111,0.08)'};
`

export const PriorityBadge = styled.span`
  display: inline-flex;
  align-items: center;
  height: 26px;
  padding: 0 10px;
  border-radius: 13px;
  font-family: ${CC_FONT_BODY};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${commandCenterColors.gold};
  border: 1px solid rgba(244, 196, 48, 0.45);
  background: rgba(244, 196, 48, 0.08);
`

export const ActionPill = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  padding: 0 18px;
  border-radius: 19px;
  border: 1px solid ${commandCenterColors.pillBorder};
  background: ${commandCenterColors.pillBg};
  font-family: ${CC_FONT_BODY};
  font-size: 13px;
  font-weight: 600;
  color: ${commandCenterColors.gold};
  white-space: nowrap;
`

const emblemPulse = keyframes`
  0%, 100% { opacity: 0.07; transform: scale(1); }
  50% { opacity: 0.08; transform: scale(1.02); }
`

export const MelegaEmblem = styled.div`
  width: 210px;
  height: 210px;
  border-radius: 50%;
  background: url('/images/melega.png') center / cover no-repeat;
  opacity: 0.07;
  animation: ${emblemPulse} 8s ease-in-out infinite;
  flex-shrink: 0;
  align-self: center;
`

export const EmptyBlock = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
  padding: 24px 16px;
`

export const EmptyIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid ${commandCenterColors.cardBorder};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: ${commandCenterColors.gold};
`

export const EmptyTitle = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 15px;
  font-weight: 700;
  color: ${commandCenterColors.white};
`

export const EmptyDescription = styled.div`
  font-family: ${CC_FONT_BODY};
  font-size: 13px;
  font-weight: 400;
  line-height: ${commandCenterType.lineHeight};
  color: ${commandCenterColors.muted};
  max-width: 360px;
`
