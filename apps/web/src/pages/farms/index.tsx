import { useContext } from 'react'
import { SUPPORT_FARMS } from 'config/constants/supportChains'
import { FarmsPageLayout, FarmsContext } from 'views/Farms'
import FarmCard from 'views/Farms/components/FarmCard/FarmCard'
import { getDisplayApr } from 'views/Farms/components/getDisplayApr'
import { usePriceCakeBusd } from 'state/farms/hooks'
import { useAccount } from 'wagmi'

const FarmsPage = () => {
  const { address: account } = useAccount()
  const { chosenFarmsMemoized } = useContext(FarmsContext)
  const lpFarms = chosenFarmsMemoized.filter((farm) => !farm.isTokenOnly)
  console.log(lpFarms)
  const cakePrice = usePriceCakeBusd()
  const activeFarms = lpFarms.filter((farm) => (farm.apr !== 0 && farm.apr !== null && farm.apr !== undefined) || farm.lpRewardsApr !== 0)
  
  return (
    <>
      {lpFarms.map(farm => (
        <FarmCard
          key={farm.pid}
          farm={farm}
          displayApr={getDisplayApr(farm.apr, farm.lpRewardsApr)}
          cakePrice={cakePrice}
          account={account}
          removed={false}
        />
      ))}
    </>
  );
}

FarmsPage.Layout = FarmsPageLayout

FarmsPage.chains = SUPPORT_FARMS

export default FarmsPage
