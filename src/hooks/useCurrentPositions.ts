import { useQuery } from '@tanstack/react-query'
import { getCurrentPositionsAmount } from 'derify-apis-v20'

import { Rec } from '@/typings'

export const useCurrentPositions = (quoteToken: string, marginToken: string) => {
  const { data, refetch } = useQuery(
    [`useCurrentPositionsAmount-${marginToken}`],
    async () => {
      if (quoteToken && marginToken) {
        const { data } = await getCurrentPositionsAmount<{ data: Rec }>(quoteToken, marginToken)
        return data
      }
      return null
    },
    {
      retry: 0,
      initialData: null,
      refetchInterval: 5000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch }
}
