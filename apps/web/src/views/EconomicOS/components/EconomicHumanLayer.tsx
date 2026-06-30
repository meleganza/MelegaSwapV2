import React from 'react'
import styled from 'styled-components'
import { melegaOperational as tokens } from 'ui/tokens'

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${tokens.sectionGap};
`

/** Default visible layer — human-readable, action-oriented content only. */
export const EconomicHumanLayer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Wrap>{children}</Wrap>
)

export default EconomicHumanLayer
