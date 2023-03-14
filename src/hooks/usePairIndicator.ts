import { useQuery } from '@tanstack/react-query'

import { MarginTokenKeys } from '@/typings'
import { getPairIndicator } from '@/api'
import { bnPlus, keepDecimals } from '@/utils/tools'
import { findMarginToken, findToken, QUOTE_TOKENS } from '@/config/tokens'

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

export const usePairIndicator = (marginToken: MarginTokenKeys): { data?: Record<string, any> } => {
  const output = initial()

  const { data } = useQuery(
    ['getPairIndicator'],
    async (): Promise<Record<string, any>[]> => {
      const m = findMarginToken(marginToken)!
      const data = await getPairIndicator(m.tokenAddress)
      // console.info(data?.data)
      return data?.data ?? []
    },
    {
      retry: false,
      initialData: [],
      refetchInterval: 3000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  if (data.length > 0) {
    data.forEach(
      ({
        token,
        longMarginTokenPmrRate = 0,
        longDrfPmrRate = 0,
        shortDrfPmrRate = 0,
        shortMarginTokenPmrRate = 0,
        price_change_rate = 0,
        ...rest
      }: Record<string, any>) => {
        const quote = findToken(token).symbol
        const longPmrRate = bnPlus(longDrfPmrRate, longMarginTokenPmrRate)
        const shortPmrRate = bnPlus(shortDrfPmrRate, shortMarginTokenPmrRate)
        const pmrRateMax = keepDecimals(Math.max(Number(longPmrRate), Number(shortPmrRate)), 4)

        output[quote] = {
          ...output[quote],
          ...rest,
          apy: pmrRateMax,
          token,
          longPmrRate,
          shortPmrRate,
          price_change_rate
        }
      }
    )
    // console.info(output)
    return { data: output }
  }

  return { data: undefined }
}
