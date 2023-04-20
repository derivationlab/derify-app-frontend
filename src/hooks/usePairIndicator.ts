import { useQuery } from '@tanstack/react-query'
import { chunk, isEmpty } from 'lodash'
import { BigNumberish } from '@ethersproject/bignumber'

import multicall from '@/utils/multicall'
import { formatUnits, safeInterceptionValues } from '@/utils/tools'
import { DEFAULT_MARGIN_TOKEN, MARGIN_TOKENS, QUOTE_TOKENS } from '@/config/tokens'
import { MarginTokenKeys, MarginTokenWithQuote, QuoteTokenKeys } from '@/typings'

import DerifyDerivativeAbi from '@/config/abi/DerifyDerivative.json'

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

export const usePCFAndPrice = (factoryConfig?: Record<string, any>) => {
  const output1 = initialPCFAndPrice()
  const output2 = initialPCFAndPrice()

  const { data, refetch, isLoading } = useQuery(
    ['usePCFAndPrice'],
    async () => {
      if (factoryConfig && factoryConfig[DEFAULT_MARGIN_TOKEN.symbol].BTC) {
        const calls1: any[] = []
        const calls2: any[] = []

        for (const k in factoryConfig) {
          for (const j in factoryConfig[k as MarginTokenKeys]) {
            calls1.push({
              name: 'getPositionChangeFeeRatio',
              address: factoryConfig[k as MarginTokenKeys][j as QuoteTokenKeys],
              quoteToken: j,
              marginToken: k
            })
            calls2.push({
              name: 'getSpotPrice',
              address: factoryConfig[k as MarginTokenKeys][j as QuoteTokenKeys],
              quoteToken: j,
              marginToken: k
            })
          }
        }

        const calls = [...calls1, ...calls2]

        const response = await multicall(DerifyDerivativeAbi, calls)

        if (!isEmpty(response)) {
          const _chunk = chunk(response, calls1.length) as any[]
          _chunk[0].forEach((ratio: BigNumberish, index: number) => {
            const _ratio = formatUnits(String(ratio), 8)
            const { marginToken, quoteToken } = calls1[index]
            output1[marginToken as MarginTokenKeys] = {
              ...output1[marginToken as MarginTokenKeys],
              [quoteToken]: _ratio
            }
          })
          _chunk[1].forEach((spotPrice: BigNumberish, index: number) => {
            const { marginToken, quoteToken } = calls2[index]
            output2[marginToken as MarginTokenKeys] = {
              ...output2[marginToken as MarginTokenKeys],
              [quoteToken]: safeInterceptionValues(String(spotPrice), 8)
            }
          })

          return { output1, output2 }
        }
      }
      return { output1, output2 }
    },
    {
      retry: false,
      initialData: { output1, output2 },
      refetchInterval: 3000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data1: data.output1, data2: data.output2, refetch, isLoading }
}
