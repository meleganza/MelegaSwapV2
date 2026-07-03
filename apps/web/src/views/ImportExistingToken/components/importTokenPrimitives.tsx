import styled, { keyframes } from 'styled-components'
import { IT_FONT_BODY, IT_FONT_DISPLAY, importTokenColors, importTokenLayout } from '../importTokenTokens'

export const ItPanel = styled.div`
  background: ${importTokenColors.panel};
  border: 1px solid ${importTokenColors.border};
  border-radius: ${importTokenLayout.cardRadius};
  box-sizing: border-box;
  overflow: hidden;
  transition: transform ${importTokenLayout.transition} ease, border-color ${importTokenLayout.transition} ease;

  &:hover {
    border-color: rgba(214, 180, 69, 0.35);
    transform: translateY(-${importTokenLayout.cardLift});
  }
`

export const ItCardTitle = styled.h3`
  margin: 0;
  font-family: ${IT_FONT_DISPLAY};
  font-size: 20px;
  font-weight: 600;
  color: ${importTokenColors.white};
`

export const ItSectionLabel = styled.div`
  font-family: ${IT_FONT_BODY};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: ${importTokenColors.gold};
  margin-bottom: 10px;
`

export const ItBody = styled.p`
  margin: 0;
  font-family: ${IT_FONT_BODY};
  font-size: 14px;
  line-height: 22px;
  color: ${importTokenColors.body};
`

export const ItPrimaryBtn = styled.button<{ $width?: string; $height?: string }>`
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || '56px'};
  border: none;
  border-radius: 14px;
  background: ${importTokenColors.gold};
  color: #050505;
  font-family: ${IT_FONT_BODY};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform ${importTokenLayout.btnTransition} ease, background ${importTokenLayout.transition} ease;

  &:hover {
    background: ${importTokenColors.goldHover};
    transform: scale(1.02);
  }
`

export const ItOutlineBtn = styled.button<{ $width?: string; $height?: string }>`
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || '44px'};
  border-radius: 14px;
  border: 1px solid ${importTokenColors.gold};
  background: ${importTokenColors.goldBg};
  color: ${importTokenColors.gold};
  font-family: ${IT_FONT_BODY};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: transform ${importTokenLayout.btnTransition} ease;

  &:hover {
    transform: scale(1.02);
  }
`

export const ItInput = styled.input`
  width: 100%;
  height: 58px;
  border-radius: 14px;
  border: 1px solid ${importTokenColors.border};
  background: #0a0a0a;
  color: ${importTokenColors.white};
  font-family: ${IT_FONT_BODY};
  font-size: 15px;
  padding: 0 16px;
  box-sizing: border-box;

  &::placeholder {
    color: ${importTokenColors.muted};
  }

  &:focus {
    outline: none;
    border-color: ${importTokenColors.gold};
  }
`

export const ItBadge = styled.span<{ $variant?: 'green' | 'gold' }>`
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid ${({ $variant }) => ($variant === 'green' ? importTokenColors.green : importTokenColors.gold)};
  color: ${({ $variant }) => ($variant === 'green' ? importTokenColors.green : importTokenColors.gold)};
  background: ${({ $variant }) =>
    $variant === 'green' ? 'rgba(27,231,122,0.08)' : importTokenColors.goldBg};
  font-family: ${IT_FONT_BODY};
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
`

export const ItStatusDot = styled.span<{ $tone: 'green' | 'yellow' | 'red' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${({ $tone }) =>
    $tone === 'green' ? importTokenColors.green : $tone === 'yellow' ? importTokenColors.yellow : importTokenColors.red};
`

export const ItSourceTag = styled.span`
  font-family: ${IT_FONT_BODY};
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${importTokenColors.muted};
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid ${importTokenColors.border};
  background: rgba(255, 255, 255, 0.02);
`

const manifestFade = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

export const ItManifestPre = styled.pre`
  animation: ${manifestFade} ${importTokenLayout.manifestFade} ease-out both;
`

const gaugeAnim = keyframes`
  from { --ring-angle: 0deg; }
`

export const ItGauge = styled.div<{ $score: number }>`
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: conic-gradient(
    ${importTokenColors.green} calc(var(--ring-angle, 0deg)),
    rgba(255, 255, 255, 0.06) 0
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
  animation: ${({ $score }) => keyframes`
    from { --ring-angle: 0deg; }
    to { --ring-angle: ${$score * 3.6}deg; }
  `} ${importTokenLayout.gaugeAnim} ease-out both;

  &::before {
    content: '';
    position: absolute;
    inset: 14px;
    border-radius: 50%;
    background: ${importTokenColors.panel};
  }
`

export const ItGaugeValue = styled.span`
  position: relative;
  z-index: 1;
  font-family: ${IT_FONT_DISPLAY};
  font-size: 42px;
  font-weight: 700;
  color: ${importTokenColors.green};
  line-height: 1;
`

export const ItGaugeLabel = styled.span`
  position: relative;
  z-index: 1;
  font-family: ${IT_FONT_BODY};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${importTokenColors.muted};
  margin-top: 6px;
  text-align: center;
  max-width: 120px;
`
