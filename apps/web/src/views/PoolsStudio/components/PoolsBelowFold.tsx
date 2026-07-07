import React from 'react'
import styled from 'styled-components'
import { poolsStudioLayout } from '../poolsStudioTokens'
import PoolsBottomRow from './PoolsBottomRow'

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`

export const PoolsBelowFold: React.FC = () => (
  <Wrap data-ps-below-fold-panels>
    <PoolsBottomRow />
  </Wrap>
)

export default PoolsBelowFold
