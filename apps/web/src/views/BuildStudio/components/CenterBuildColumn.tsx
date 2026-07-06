import React from 'react'
import styled from 'styled-components'
import { buildStudioLayout } from '../buildStudioTokens'
import CreateTokenPanel from './CreateTokenPanel'
import { CreateFarmCard, StakingPoolCard } from './SecondRowCards'

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${buildStudioLayout.cardGap};
  min-width: 0;
`

export const CenterBuildColumn: React.FC = () => (
  <Stack data-bs-center-column>
    <CreateTokenPanel />
    <CreateFarmCard />
    <StakingPoolCard />
  </Stack>
)

export default CenterBuildColumn
