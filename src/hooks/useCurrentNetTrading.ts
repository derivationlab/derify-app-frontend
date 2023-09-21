import { useQuery } from '@tanstack/react-query'
import { getCurrentTotalTradingNetValue } from 'derify-apis-test'

import { Rec } from '@/typings'

const init = { trading_net_value: 0 }
export const useCurrentNetTrading = (marginToken: string, quoteToken: string) => {
  const { data, refetch } = useQuery(
    ['useCurrentTotalTradingNetValue'],
    async (): Promise<typeof init> => {
      const { data } = await getCurrentTotalTradingNetValue<{ data: Rec }>(marginToken, quoteToken)

      return data?.[0] ?? init
    },
    {
      retry: 0,
      initialData: init,
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch }
}
