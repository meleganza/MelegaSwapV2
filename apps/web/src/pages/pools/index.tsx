import Pools from 'views/Pools'
import { SUPPORT_FARMS } from 'config/constants/supportChains'

const PoolsPage = () => {
    return (
      <Pools />
    )
  }

PoolsPage.Layout = Pools

PoolsPage.chains = SUPPORT_FARMS

export default PoolsPage