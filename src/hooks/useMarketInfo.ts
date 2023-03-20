import { flatten, chunk } from 'lodash'
import { useQuery } from '@tanstack/react-query'

import multicall from '@/utils/multicall'
import { bnPlus, formatUnits, isGTET } from '@/utils/tools'
import { MarginToken, MarginTokenKeys } from '@/typings'
import { getCurrentTradingAmount, getPairIndicator } from '@/api'
import { DEFAULT_MARGIN_TOKEN, findToken, MARGIN_TOKENS } from '@/config/tokens'

import DerifyDerivativeAbi from '@/config/abi/DerifyDerivative.json'

const initial1 = (): MarginToken => {
  let value = Object.create(null)

  MARGIN_TOKENS.forEach((t) => {
    value = {
      ...value,
      [t.symbol]: '0'
    }
  })

  return value
}

export const usePositionInfo = (factoryConfig?: Record<string, any>) => {
  let output = initial1()
  const { data, refetch } = useQuery(
    ['usePositionInfo'],
    async () => {
      if (factoryConfig && factoryConfig[DEFAULT_MARGIN_TOKEN.symbol].BTC) {
        const calls = Object.values(factoryConfig).map((quotes: string, j) =>
          Object.values(quotes).map((quote, k) => ({
            name: 'getSideTotalAmount',
            address: quote,
            quoteToken: Object.keys(quotes)[k],
            marginToken: Object.keys(factoryConfig)[j]
          }))
        )
        const flatterCalls = flatten(calls)

        const response = await multicall(DerifyDerivativeAbi, flatterCalls)

        if (response.length > 0) {
          const _chunk = chunk(response, response.length / 2)
          _chunk.forEach((values: any, index: number) => {
            const sum = values.reduce((s1: number, [longTotalAmount, shortTotalAmount]: any[]) => {
              const s2 = bnPlus(formatUnits(longTotalAmount, 8), formatUnits(shortTotalAmount, 8))
              return bnPlus(s1, s2)
            }, 0)
            output = {
              ...output,
              [Object.keys(factoryConfig)[index]]: sum
            }
          })

          // console.info(output)

          return output
        }

        return output
      }

      return output
    },
    {
      retry: false,
      initialData: output,
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch }
}

export const useMulCurrentTradingAmount = () => {
  let output = initial1()

  const { data, refetch } = useQuery(
    ['useMulCurrentTradingAmount'],
    async (): Promise<Record<string, any>> => {
      const promises = MARGIN_TOKENS.map(async (token) => {
        return [await getCurrentTradingAmount('all', token.tokenAddress).then(({ data }) => data)]
      })

      const response = await Promise.all(promises)

      if (response.length > 0) {
        response.forEach(([margin], index) => {
          output = {
            ...output,
            [MARGIN_TOKENS[index].symbol]: margin[0]?.trading_amount ?? 0
          }
        })
        // console.info(output)

        return output
      }

      return output
    },
    {
      retry: 0,
      initialData: output,
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch }
}

const initial2 = (): MarginToken => {
  let value = Object.create(null)

  MARGIN_TOKENS.forEach((t) => {
    value = {
      ...value,
      [t.symbol]: {}
    }
  })

  return value
}

export const usePairIndicators = () => {
  let output = initial2()

  const { data } = useQuery(
    ['usePairIndicators'],
    async () => {
      const promises = MARGIN_TOKENS.map(async (token) => {
        return [await getPairIndicator(token.tokenAddress).then(({ data }) => data)]
      })

      const response = await Promise.all(promises)

      if (response.length > 0) {
        response.forEach(([data], index) => {
          data.forEach(
            ({
              token,
              longDrfPmrRate = 0,
              shortDrfPmrRate = 0,
              longMarginTokenPmrRate = 0,
              shortMarginTokenPmrRate = 0
            }: Record<string, any>) => {
              const long = bnPlus(longDrfPmrRate, longMarginTokenPmrRate)
              const short = bnPlus(shortDrfPmrRate, shortMarginTokenPmrRate)
              const apyMax = isGTET(long, short) ? long : short

              output[MARGIN_TOKENS[index].symbol as MarginTokenKeys] = {
                ...output[MARGIN_TOKENS[index].symbol as MarginTokenKeys],
                [findToken(token).symbol]: Number(apyMax)
              }
            }
          )
        })
        // console.info(output)

        return output
      }

      return output
    },
    {
      retry: false,
      initialData: output,
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data }
}
