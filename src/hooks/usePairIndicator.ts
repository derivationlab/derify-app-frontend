import { BigNumberish } from '@ethersproject/bignumber'
import { useQuery } from '@tanstack/react-query'
import { chunk, isEmpty } from 'lodash'

import derifyDerivativeAbi from '@/config/abi/DerifyDerivative.json'
import { MARGIN_TOKENS, QUOTE_TOKENS } from '@/config/tokens'
import { MarginTokenKeys, MarginTokenWithQuote, QuoteTokenKeys } from '@/typings'
import multicall from '@/utils/multicall'
import { formatUnits, safeInterceptionValues } from '@/utils/tools'

export const initialPCFAndPrice = (): MarginTokenWithQuote => {
  let value = Object.create(null)
  let quote = Object.create(null)

  QUOTE_TOKENS.forEach((t) => {
    quote = {
      ...quote,
      [t.symbol]: '0'
    }
  })
  MARGIN_TOKENS.forEach((t) => {
    value = {
      ...value,
      [t.symbol]: quote
    }
  })

  return value
}

const pcfs = initialPCFAndPrice()

const prices = initialPCFAndPrice()

export const usePCFAndPrice = (config: MarginTokenWithQuote, loaded: boolean) => {
  const { data, refetch, isLoading } = useQuery(
    ['usePCFAndPrice'],
    async () => {
      if (loaded && config) {
        const pcfCalls: any[] = []
        const priceCalls: any[] = []

        for (const k in config) {
          for (const j in config[k as MarginTokenKeys]) {
            pcfCalls.push({
              name: 'getPositionChangeFeeRatio',
              address: config[k as MarginTokenKeys][j as QuoteTokenKeys],
              quoteToken: j,
              marginToken: k
            })
            priceCalls.push({
              name: 'getSpotPrice',
              address: config[k as MarginTokenKeys][j as QuoteTokenKeys],
              quoteToken: j,
              marginToken: k
            })
          }
        }

        const calls = [...pcfCalls, ...priceCalls]

        const response = await multicall(derifyDerivativeAbi, calls)

        if (!isEmpty(response)) {
          const _chunk = chunk(response, pcfCalls.length) as any[]
          _chunk[0].forEach((ratio: BigNumberish, index: number) => {
            const _ratio = formatUnits(String(ratio), 8)
            const { marginToken, quoteToken } = pcfCalls[index]
            pcfs[marginToken as MarginTokenKeys] = {
              ...pcfs[marginToken as MarginTokenKeys],
              [quoteToken]: _ratio
            }
          })
          _chunk[1].forEach((spotPrice: BigNumberish, index: number) => {
            const { marginToken, quoteToken } = priceCalls[index]
            prices[marginToken as MarginTokenKeys] = {
              ...prices[marginToken as MarginTokenKeys],
              [quoteToken]: safeInterceptionValues(String(spotPrice), 8)
            }
          })

          return { pcfs, prices }
        }
      }
      return null
    },
    {
      retry: false,
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch, isLoading }
}
