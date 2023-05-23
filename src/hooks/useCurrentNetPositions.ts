import { useQuery } from '@tanstack/react-query'

import { getCurrentTotalPositionsNetValue } from '@/api'

export const useCurrentNetPositions = (marginToken: string, quoteToken: string) => {
  const base = { total_positions_net_value: 0 }
  const { data, refetch } = useQuery(
    ['useCurrentNetPositions'],
    async (): Promise<typeof base> => {
      const data = await getCurrentTotalPositionsNetValue(marginToken, quoteToken)
      return data?.data ?? base
    },
    {
      retry: 0,
      initialData: base,
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { refetch, data }
}
