import { useQuery } from '@tanstack/react-query'
import { getCurrentTotalPositionsNetValue } from 'derify-apis'

export const useCurrentNetPositions = (marginToken: string, quoteToken: string) => {
  const base = { total_positions_net_value: 0 }
  const { data, refetch } = useQuery(
    ['useCurrentNetPositions'],
    async (): Promise<typeof base> => {
      const { data } = await getCurrentTotalPositionsNetValue<{ data: typeof base }>(marginToken, quoteToken)
      return data ?? base
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
