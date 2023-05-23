import { useQuery } from '@tanstack/react-query'

import { getCurrentTotalTradingNetValue } from '@/api'

export const useCurrentNetTrading = (marginToken: string, quoteToken: string) => {
  const base = { trading_net_value: 0 }
  const { data, refetch } = useQuery(
    ['useCurrentTotalTradingNetValue'],
    async (): Promise<typeof base> => {
      const { data } = await getCurrentTotalTradingNetValue(marginToken, quoteToken)

      return data?.[0] ?? base
    },
    {
      retry: 0,
      initialData: base,
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch }
}
