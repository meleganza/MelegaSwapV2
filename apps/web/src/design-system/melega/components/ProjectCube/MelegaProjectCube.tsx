import React from 'react'
import styled from 'styled-components'
import { colors, typography, spacing, radius } from '../../tokens'

const Cube = styled.div`
  width: 92px;
  height: 92px;
  flex-shrink: 0;
  position: relative;
  transform: perspective(500px) rotateY(-18deg) rotateX(10deg);

  @media (max-width: 767px) {
    width: 82px;
    height: 82px;
  }
`

const Face = styled.div`
  position: absolute;
  inset: 0;
  border-radius: ${radius.xl};
  background: linear-gradient(145deg, rgba(12, 10, 4, 0.95) 0%, rgba(4, 4, 4, 1) 50%, rgba(18, 14, 4, 0.9) 100%);
  border: 1px solid rgba(212, 175, 55, 0.5);
  box-shadow:
    inset 0 0 40px rgba(244, 197, 66, 0.12),
    0 0 30px rgba(212, 175, 55, 0.15);
`

const Wire = styled.svg`
  position: absolute;
  inset: 12px;
  width: calc(100% - 24px);
  height: calc(100% - 24px);
`

const Core = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 22px;
  height: 22px;
  transform: translate(-50%, -50%);
  border-radius: 4px;
  background: radial-gradient(circle, rgba(244, 197, 66, 0.85) 0%, rgba(212, 175, 55, 0.4) 60%, transparent 100%);
  box-shadow: 0 0 16px rgba(244, 197, 66, 0.5);
`

export const MelegaProjectCube: React.FC = () => (
  <Cube aria-hidden data-melega-project-cube>
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
