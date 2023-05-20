import { useQuery } from '@tanstack/react-query'

import { getCurrentTradingAmount } from '@/api'
import { marginTokenList } from '@/store'

export const useCurrentTrading = (list: (typeof marginTokenList)[]) => {
  let output = Object.create(null)

  const { data, refetch } = useQuery(
    ['useCurrentTrading'],
    async () => {
      if (list.length) {
        const promises = list.map(async (token) => {
          return [await getCurrentTradingAmount('all', token.margin_token).then(({ data }) => data)]
        })

        const response = await Promise.all(promises)

        if (response.length > 0) {
          response.forEach(([margin], index) => {
            output = {
              ...output,
              [list[index].symbol]: margin[0]?.trading_amount ?? 0
            }
          })
          // console.info(output)

          return output
        }
      }

      return null
    },
    {
      retry: 0,
      initialData: null,
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch }
}
