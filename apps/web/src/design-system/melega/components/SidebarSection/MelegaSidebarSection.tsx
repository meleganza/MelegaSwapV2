import React from 'react'
import styled from 'styled-components'
import { typography } from '../../tokens'

export interface MelegaSidebarSectionProps {
  label: string
  children: React.ReactNode
}

const Section = styled.div`
  margin-top: 14px;

  &:first-child {
    margin-top: 0;
  }
`

const Label = styled.div`
  font-family: ${typography.fontFamily.body};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.38);
  height: 14px;
  margin-bottom: 8px;
  padding: 0 12px;
`

const Items = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

export const MelegaSidebarSection: React.FC<MelegaSidebarSectionProps> = ({ label, children }) => (
  <Section>
    <Label>{label}</Label>
    <Items>{children}</Items>
  </Section>
)

export default MelegaSidebarSection
