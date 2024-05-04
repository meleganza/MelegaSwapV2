import Pools from 'views/Pools'
import { SUPPORT_ILO } from 'config/constants/supportChains'

const PoolsPage = () => {
    return (
      <Pools />
    )
  }

PoolsPage.Layout = Pools

PoolsPage.chains = SUPPORT_ILO

export default PoolsPage