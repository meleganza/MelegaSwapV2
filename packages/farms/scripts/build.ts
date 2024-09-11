/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import path from 'path'
import fs from 'fs'
import farm1 from '../constants/1'
import farm42161 from '../constants/42161'
import farm137 from '../constants/137'
import farm56 from '../constants/56'

import lpHelpers1 from '../constants/priceHelperLps/1'
import lpHelpers42161 from '../constants/priceHelperLps/42161'
import lpHelpers137 from '../constants/priceHelperLps/137'
import lpHelpers56 from '../constants/priceHelperLps/56'

const chains = [
  [1, farm1, lpHelpers1],
  [42161, farm42161, lpHelpers42161],
  [137, farm137, lpHelpers137],
  [56, farm56, lpHelpers56],
]

export const saveList = async () => {
  console.info('save farm config...')
  try {
    fs.mkdirSync(`${path.resolve()}/lists`)
    fs.mkdirSync(`${path.resolve()}/lists/priceHelperLps`)
  } catch (error) {
    //
  }
  for (const [chain, farm, lpHelper] of chains) {
    console.info('Starting build farm config', chain)
    const farmListPath = `${path.resolve()}/lists/${chain}.json`
    const stringifiedList = JSON.stringify(farm, null, 2)
    fs.writeFileSync(farmListPath, stringifiedList)
    console.info('Farm list saved to ', farmListPath)
    const lpPriceHelperListPath = `${path.resolve()}/lists/priceHelperLps/${chain}.json`
    const stringifiedHelperList = JSON.stringify(lpHelper, null, 2)
    fs.writeFileSync(lpPriceHelperListPath, stringifiedHelperList)
    console.info('Lp list saved to ', lpPriceHelperListPath)
  }
}

saveList()
