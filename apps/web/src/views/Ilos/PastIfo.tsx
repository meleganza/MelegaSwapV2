import React from 'react'
import { ifosConfig } from 'config/constants'
import { Ifo } from 'config/constants/types'
import IfoLayout from './components/IfoLayout'
import IfoCardV3Data from './components/IfoCardV3Data'

const inactiveIfo: Ifo[] = ifosConfig.filter((ifo) => !ifo.isActive)

const PastIfo = () => {
  return (
    <IfoLayout/>
  )
}

export default PastIfo
