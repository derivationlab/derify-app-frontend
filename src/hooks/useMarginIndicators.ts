import { useQuery } from '@tanstack/react-query'
import { getMarginIndicators, getDerivativeIndicator } from 'derify-apis-test'

import { Rec } from '@/typings'
import { bnPlus, isGTET, keepDecimals } from '@/utils/tools'

export const useMarginIndicators = (marginTokenAddress: string) => {
  const output = Object.create(null)
  const { data, isLoading } = useQuery(
    ['useMarginIndicators'],
    async () => {
      const { data } = await getMarginIndicators<{ data: Rec }>(marginTokenAddress)
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
          }: Rec) => {
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
      }
      return output
    },
    {
      retry: false,
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, isLoading }
}

export const useAllMarginIndicators = (list: string[]) => {
  const output = Object.create(null)
  const { data, isLoading } = useQuery(
    ['useAllMarginIndicators'],
    async () => {
      if (list.length) {
        const promises = list.map(async (address) => {
          return [await getDerivativeIndicator<{ data: Rec }>(address).then(({ data }) => data)]
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
        }
      }
      return output
    },
    {
      retry: false,
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, isLoading }
}
