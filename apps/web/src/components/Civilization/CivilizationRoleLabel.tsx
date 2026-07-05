import React from 'react'
import styled from 'styled-components'
import { premiumStudioColors } from 'design-system/melega/tokens/premiumStudio'
import type { CivilizationModule } from 'lib/surface-envelope/civilizationRoles'
import { CIVILIZATION_ROLE_LABELS } from 'lib/surface-envelope/civilizationRoles'

const Role = styled.span`
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid ${premiumStudioColors.cardBorder};
  background: rgba(255, 255, 255, 0.03);
  color: ${premiumStudioColors.muted};
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
`

export const CivilizationRoleLabel: React.FC<{ module: CivilizationModule }> = ({ module }) => (
  <Role data-civilization-role={module}>{CIVILIZATION_ROLE_LABELS[module]}</Role>
)

export default CivilizationRoleLabel
