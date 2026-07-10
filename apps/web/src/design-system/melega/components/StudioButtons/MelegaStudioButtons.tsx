import styled from 'styled-components'
import {
  STUDIO_FONT_BODY,
  studioConstitutionColors,
  studioConstitutionLayout,
} from '../../tokens/studioConstitution'

const baseBtn = `
  font-family: ${STUDIO_FONT_BODY};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-sizing: border-box;
  white-space: nowrap;
  transition: filter ${studioConstitutionLayout.hoverTransition} ease,
    border-color ${studioConstitutionLayout.hoverTransition} ease,
    background ${studioConstitutionLayout.hoverTransition} ease,
    transform ${studioConstitutionLayout.hoverTransition} ease;
`

export const MelegaStudioPrimaryBtn = styled.button`
  ${baseBtn}
  height: ${studioConstitutionLayout.btnHeight};
  min-height: ${studioConstitutionLayout.btnHeight};
  padding: 0 18px;
  border: none;
  border-radius: ${studioConstitutionLayout.btnRadius};
  background: linear-gradient(180deg, #f6d44a 0%, ${studioConstitutionColors.gold} 100%);
  color: #050505;
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.2);

  &:hover:not(:disabled) {
    filter: brightness(1.05);
    transform: ${studioConstitutionLayout.cardHoverLift};
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`

export const MelegaStudioOutlineBtn = styled.button`
  ${baseBtn}
  height: ${studioConstitutionLayout.btnHeight};
  min-height: ${studioConstitutionLayout.btnHeight};
  padding: 0 18px;
  border-radius: ${studioConstitutionLayout.btnRadius};
  border: 1px solid ${studioConstitutionColors.gold};
  background: ${studioConstitutionColors.goldBg};
  color: ${studioConstitutionColors.gold};

  &:hover:not(:disabled) {
    border-color: ${studioConstitutionColors.cardBorderHover};
    background: rgba(212, 175, 55, 0.2);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`

export const MelegaStudioGhostBtn = styled.button`
  ${baseBtn}
  height: ${studioConstitutionLayout.btnHeight};
  min-height: ${studioConstitutionLayout.btnHeight};
  padding: 0 18px;
  border-radius: ${studioConstitutionLayout.btnRadius};
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: transparent;
  color: ${studioConstitutionColors.text};

  &:hover:not(:disabled) {
    border-color: rgba(212, 175, 55, 0.45);
    color: ${studioConstitutionColors.gold};
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`

export const MelegaStudioSecondaryBtn = MelegaStudioOutlineBtn
