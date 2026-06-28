import React from 'react'
import styled from 'styled-components'
import { cmd } from '../tokens'

const Layer = styled.div`
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
`

const NetworkFlow = styled(Layer)`
  opacity: 0.12;
  background-image: radial-gradient(circle at 1px 1px, rgba(212, 175, 55, 0.35) 1px, transparent 0);
  background-size: 28px 28px;
`

const OrbitalGlow = styled(Layer)`
  &::before {
    content: '';
    position: absolute;
    top: 42%;
    left: 50%;
    width: min(680px, 90vw);
    height: min(680px, 90vw);
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: radial-gradient(circle, rgba(212, 175, 55, 0.14) 0%, rgba(212, 175, 55, 0.04) 42%, transparent 68%);
  }

  &::after {
    content: '';
    position: absolute;
    top: 42%;
    left: 50%;
    width: min(520px, 75vw);
    height: min(520px, 75vw);
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 1px solid rgba(212, 175, 55, 0.08);
    box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.04), inset 0 0 60px rgba(212, 175, 55, 0.03);
  }
`

const CommandBackground: React.FC = () => (
  <>
    <NetworkFlow aria-hidden />
    <OrbitalGlow aria-hidden />
  </>
)

export default CommandBackground
