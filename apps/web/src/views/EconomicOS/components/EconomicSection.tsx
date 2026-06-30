import React from 'react'
import styled from 'styled-components'
import { melegaOperational as tokens } from 'ui/tokens'

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const Title = styled.h2`
  margin: 0;
  font-family: ${tokens.fontDisplay};
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: ${tokens.text};
`

const Lead = styled.p`
  margin: -8px 0 0;
  font-size: 14px;
  color: ${tokens.textSecondary};
  line-height: 1.65;
  max-width: 680px;
`

const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Grid = styled.div<{ $columns?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns ?? 1}, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

export interface EconomicSectionProps {
  title: string
  lead?: string
  columns?: number
  children: React.ReactNode
}

export const EconomicSection: React.FC<EconomicSectionProps> = ({
  title,
  lead,
  columns,
  children,
}) => (
  <Section>
    <Title>{title}</Title>
    {lead && <Lead>{lead}</Lead>}
    {columns && columns > 1 ? <Grid $columns={columns}>{children}</Grid> : <Body>{children}</Body>}
  </Section>
)

export default EconomicSection
