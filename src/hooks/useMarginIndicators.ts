import { useQuery } from '@tanstack/react-query'

import { getMarginIndicators, getPairIndicator } from '@/api'
import { marginTokenList } from '@/store'
import { bnPlus, isGTET, keepDecimals } from '@/utils/tools'

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
  const output = Object.create(null)
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

export const useAllMarginIndicators = (list: string[]) => {
  const output = Object.create(null)

  const { data } = useQuery(
    ['useAllMarginIndicators'],
    async () => {
      if (list.length) {
        const promises = list.map(async (address) => {
          return [await getPairIndicator(address).then(({ data }) => data)]
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

                output[list[index]] = {
                  ...output[list[index]],
                  [token]: Number(apyMax)
                }
              }
            )
          })
          return output
        }
      }

      return null
    },
    {
      retry: false,
      initialData: null,
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data }
}
