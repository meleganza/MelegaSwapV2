import { GetStaticPaths, GetStaticProps } from 'next'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { CHAIN_IDS } from 'utils/wagmi'
import { buildLiquidityCanonicalOwnership, LIQUIDITY_ALIAS_ROUTES } from 'lib/liquidity-runtime/canonicalOwnership'

const AddLiquidityPage = () => {
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) return
    const [token0, token1] = Array.isArray(router.query.currency) ? router.query.currency : []
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
    params.set('view', 'add')
    if (token0) params.set('token0', token0)
    if (token1) params.set('token1', token1)
    void router.replace(`/liquidity?${params.toString()}`)
  }, [router])

  return null
}

AddLiquidityPage.chains = CHAIN_IDS
AddLiquidityPage.liquidityRuntimeAlias = buildLiquidityCanonicalOwnership(LIQUIDITY_ALIAS_ROUTES.add)

export default AddLiquidityPage

const OLD_PATH_STRUCTURE = /^(0x[a-fA-F0-9]{40}|BNB)-(0x[a-fA-F0-9]{40}|BNB)$/

export const getStaticPaths: GetStaticPaths = () => {
  return {
    paths: [{ params: { currency: [] } }],
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { currency = [] } = params
  const [currencyIdA, currencyIdB] = currency
  const match = currencyIdA?.match(OLD_PATH_STRUCTURE)

  if (match?.length) {
    return {
      redirect: {
        statusCode: 301,
        destination: `/add/${match[1]}/${match[2]}`,
      },
    }
  }

  if (currencyIdA && currencyIdB && currencyIdA.toLowerCase() === currencyIdB.toLowerCase()) {
    return {
      redirect: {
        statusCode: 303,
        destination: `/add/${currencyIdA}`,
      },
    }
  }

  return {
    props: {},
  }
}
