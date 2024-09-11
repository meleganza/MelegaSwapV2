import React, { useEffect, useMemo, useState } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Route, useRouteMatch, Link } from 'react-router-dom'
import { ButtonMenu, ButtonMenuItem, Flex } from '@pancakeswap/uikit'
import Container from 'components/Layout/Container'
import Hero from './components/Hero'
import CurrentIfo from './CurrentIfo'
import PastIfo from './PastIfo'

const Ilos = () => {
  // const { path, url, isExact } = useRouteMatch()
  return (
    <>
      <Container>
        {/* <Route exact path={`${path}`}> */}
          <CurrentIfo />
        {/* </Route> */}
      </Container>
    </>
  )
}

export default Ilos
