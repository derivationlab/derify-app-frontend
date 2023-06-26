import { useQuery } from '@tanstack/react-query'

import { getCurrentPositionsAmount } from '@/api'

export const useCurrentPositions = (quoteToken: string, marginToken: string) => {
  const { data, refetch } = useQuery(
    [`useCurrentPositionsAmount-${marginToken}`],
    async () => {
      if (quoteToken && marginToken) {
        const data = await getCurrentPositionsAmount(quoteToken, marginToken)
        return data?.data
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
