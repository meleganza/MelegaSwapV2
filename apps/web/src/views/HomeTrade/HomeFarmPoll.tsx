import React from 'react'
import { usePollFarmsWithUserData } from 'state/farms/hooks'

function HomeFarmPollActive() {
  usePollFarmsWithUserData()
  return null
}

/** Full farm multicall starts only when Home TVL or Top Farms is on screen. */
export const HomeFarmPoll: React.FC<{ enabled: boolean }> = ({ enabled }) => (enabled ? <HomeFarmPollActive /> : null)

export default HomeFarmPoll
