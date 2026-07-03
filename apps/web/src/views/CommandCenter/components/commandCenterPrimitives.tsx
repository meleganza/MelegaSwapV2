import styled from 'styled-components'
import { CC_FONT_BODY, CC_FONT_DISPLAY, commandCenterColors, commandCenterLayout } from '../commandCenterTokens'

export const CcPanel = styled.div<{ $emphasis?: boolean; $padding?: string; $dash?: boolean }>`
  background: ${commandCenterColors.panel};
  border: 1px solid ${({ $emphasis }) => ($emphasis ? commandCenterColors.borderGold : commandCenterColors.border)};
  border-radius: ${commandCenterLayout.cardRadius};
  box-sizing: border-box;
  padding: ${({ $padding }) => $padding || commandCenterLayout.cardPadding};
  transition: ${({ $dash }) =>
    $dash ? 'border-color 180ms ease' : `transform ${commandCenterLayout.transition} ease, border-color ${commandCenterLayout.transition} ease, box-shadow ${commandCenterLayout.transition} ease`};

  &:hover {
    border-color: ${commandCenterColors.borderGold};
    ${({ $dash }) =>
      $dash
        ? ''
        : `
    transform: translateY(-${commandCenterLayout.cardLift});
    box-shadow: ${commandCenterColors.shadow};
    `}
  }
`

/** Dashboard grid card — no hover lift, flex column layout */
export const CcDashCard = styled(CcPanel).attrs({ $dash: true })<{ $height?: string; $minHeight?: string }>`
  padding: ${commandCenterLayout.cardPadding};
  display: flex;
  flex-direction: column;
  gap: ${commandCenterLayout.cardGap};
  min-width: 0;
  height: ${({ $height }) => $height || 'auto'};
  min-height: ${({ $minHeight }) => $minHeight || '0'};
  overflow: hidden;
`

export const CcDashBody = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

export const CcColStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${commandCenterLayout.sectionGap};
  min-width: 0;
`

export const CcTitle = styled.h3`
  margin: 0;
  font-family: ${CC_FONT_DISPLAY};
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${commandCenterColors.white};
`

export const CcCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
`

export const CcViewAll = styled.a`
  font-family: ${CC_FONT_BODY};
  font-size: 12px;
  font-weight: 600;
  color: ${commandCenterColors.gold};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`

export const CcBody = styled.p`
  margin: 0;
  font-family: ${CC_FONT_BODY};
  font-size: 13px;
  line-height: 20px;
  color: ${commandCenterColors.body};
`

export const CcGoldBtn = styled.button`
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 14px;
  background: ${commandCenterColors.gold};
  color: #050505;
  font-family: ${CC_FONT_BODY};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: transform ${commandCenterLayout.btnTransition} ease;

  &:hover {
    transform: scale(1.02);
  }
`

export const CcOutlineBtn = styled.button`
  width: 100%;
  height: 40px;
  border-radius: 14px;
  border: 1px solid ${commandCenterColors.gold};
  background: ${commandCenterColors.goldBg};
  color: ${commandCenterColors.gold};
  font-family: ${CC_FONT_BODY};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
`

export const CcPill = styled.span<{ $tone?: 'green' | 'yellow' | 'red' | 'gold' }>`
  height: 22px;
  padding: 0 8px;
  border-radius: 999px;
  font-family: ${CC_FONT_BODY};
  font-size: 10px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  ${({ $tone }) => {
    if ($tone === 'green')
      return `border: 1px solid ${commandCenterColors.green}; color: ${commandCenterColors.green}; background: rgba(27,231,122,0.1);`
    if ($tone === 'red')
      return `border: 1px solid ${commandCenterColors.red}; color: ${commandCenterColors.red}; background: rgba(240,75,75,0.1);`
    if ($tone === 'yellow')
      return `border: 1px solid ${commandCenterColors.yellow}; color: ${commandCenterColors.yellow}; background: rgba(244,197,66,0.1);`
    return `border: 1px solid ${commandCenterColors.gold}; color: ${commandCenterColors.gold}; background: ${commandCenterColors.goldBg};`
  }}
`

export const CcProgressTrack = styled.div`
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
`

export const CcProgressFill = styled.div<{ $pct: number }>`
  height: 100%;
  width: ${({ $pct }) => $pct}%;
  border-radius: 999px;
  background: ${commandCenterColors.gold};
`
