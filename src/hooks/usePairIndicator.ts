import { useQuery } from '@tanstack/react-query'

import { MarginTokenKeys } from '@/typings'
import { getPairIndicator } from '@/api'
import { findMarginToken, findToken, QUOTE_TOKENS } from '@/config/tokens'
import { bnPlus, nonBigNumberInterception } from '@/utils/tools'

export const initial = (): Record<string, any> => {
  let quote = Object.create(null)

  QUOTE_TOKENS.forEach((t) => {
    quote = {
      ...quote,
      [t.symbol]: {}
    }
  })

  return quote
}

export const usePairIndicator = (marginToken: MarginTokenKeys): { data?: Record<string, any>; isLoading: boolean } => {
  let output = initial()

  const { data, isLoading } = useQuery(
    ['getPairIndicator'],
    async (): Promise<Record<string, any>> => {
      const m = findMarginToken(marginToken)!
      const { data } = await getPairIndicator(m.tokenAddress)
      return data
    },
    {
      retry: false,
      refetchInterval: 30000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  if (!isLoading && data) {
    data.forEach(
      ({
        token,
        longUsdPmrRate = 0,
        longDrfPmrRate = 0,
        shortDrfPmrRate = 0,
        shortUsdPmrRate = 0,
        price_change_rate = 0,
        ...rest
      }: Record<string, any>) => {
        const quote = findToken(token).symbol
        const changeRate = nonBigNumberInterception(String(price_change_rate), 4)
        const longPmrRate = nonBigNumberInterception(bnPlus(longDrfPmrRate, longUsdPmrRate))
        const shortPmrRate = nonBigNumberInterception(bnPlus(shortDrfPmrRate, shortUsdPmrRate))
        const apyMax = Math.max(Number(longPmrRate), Number(shortPmrRate))

        output[quote] = {
          ...output[quote],
          ...rest,
          apy: apyMax,
          token,
          longPmrRate,
          shortPmrRate,
          price_change_rate: changeRate
        }
      }
    )
    // console.info(output)
    return { data: output, isLoading }
  }

  return { isLoading: true }
}
