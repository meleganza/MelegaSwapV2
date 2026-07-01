import React from 'react'
import styled from 'styled-components'
import { colors } from '../../tokens'

const Cube = styled.div`
  width: 66px;
  height: 66px;
  position: relative;
  transform: perspective(520px) rotateY(-18deg) rotateX(10deg) scale(0.86);
  transform-origin: center center;

  @media (max-width: 767px) {
    width: 84px;
    height: 84px;
    transform: perspective(520px) rotateY(-18deg) rotateX(10deg);
  }
`

const Glow = styled.div`
  position: absolute;
  inset: -12px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(244, 197, 66, 0.18) 0%, transparent 68%);
  pointer-events: none;
`

const Face = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 16px;
  background: linear-gradient(145deg, rgba(12, 10, 4, 0.55) 0%, rgba(4, 4, 4, 0.85) 50%, rgba(18, 14, 4, 0.65) 100%);
  border: 1px solid rgba(212, 175, 55, 0.5);
  box-shadow:
    inset 0 0 40px rgba(244, 197, 66, 0.1),
    0 0 30px rgba(212, 175, 55, 0.12);
  backdrop-filter: blur(2px);
`

const Wire = styled.svg`
  position: absolute;
  inset: 14px;
  width: calc(100% - 28px);
  height: calc(100% - 28px);
`

const Core = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 24px;
  height: 24px;
  transform: translate(-50%, -50%);
  border-radius: 4px;
  background: radial-gradient(circle, rgba(244, 197, 66, 0.9) 0%, rgba(212, 175, 55, 0.45) 60%, transparent 100%);
  box-shadow: 0 0 20px rgba(244, 197, 66, 0.55);
`

export const MelegaProjectCube: React.FC = () => (
  <Cube aria-hidden data-melega-project-cube>
    <Glow />
    <Face />
    <Wire viewBox="0 0 68 68" fill="none">
      <rect x="8" y="8" width="52" height="52" stroke="rgba(212,175,55,0.45)" strokeWidth="1" />
      <path d="M8 8 L34 34 M60 8 L34 34 M8 60 L34 34 M60 60 L34 34" stroke="rgba(244,197,66,0.35)" strokeWidth="0.75" />
      <rect x="20" y="20" width="28" height="28" stroke="rgba(212,175,55,0.25)" strokeWidth="0.75" strokeDasharray="3 2" />
    </Wire>
    <Core />
  </Cube>
)

export default MelegaProjectCube
