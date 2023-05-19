import { useQuery } from '@tanstack/react-query'

import { getMarginIndicators } from '@/api'
import { bnPlus, keepDecimals } from '@/utils/tools'

const output = Object.create(null)

/**
 {
    "token": "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    "longMarginTokenPmrRate": "0",
    "shortMarginTokenPmrRate": "0",
    "longDrfPmrRate": "0",
    "shortDrfPmrRate": "0",
    "price_change_rate": "-0.010566311805753606"
}
 * @param marginTokenAddress
 */
export const useMarginIndicators = (marginTokenAddress: string) => {
  const { data } = useQuery(
    ['useMarginIndicators'],
    async () => {
      const { data } = await getMarginIndicators(marginTokenAddress)
      if (data && data.length > 0) {
        data.forEach(
          ({
            token,
            longDrfPmrRate = 0,
            shortDrfPmrRate = 0,
            price_change_rate = 0,
            longMarginTokenPmrRate = 0,
            shortMarginTokenPmrRate = 0,
            ...rest
          }: Record<string, any>) => {
            const longPmrRate = bnPlus(longDrfPmrRate, longMarginTokenPmrRate)
            const shortPmrRate = bnPlus(shortDrfPmrRate, shortMarginTokenPmrRate)
            const apy = keepDecimals(Math.max(Number(longPmrRate), Number(shortPmrRate)), 4)

            output[token] = {
              ...output[token],
              ...rest,
              apy,
              longPmrRate,
              shortPmrRate,
              price_change_rate
            }
          }
        )
        return output
      }
      return null
    },
    {
      retry: false,
      initialData: null,
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data }
}
