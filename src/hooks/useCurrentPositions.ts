import { useQuery } from '@tanstack/react-query'
import { isEmpty } from 'lodash'

import { getCurrentPositionsAmount } from '@/api'

export const useCurrentPositions = (quoteToken: string, marginToken: string) => {
  const { data, refetch } = useQuery(
    [`useCurrentPositionsAmount-${marginToken}`],
    async (): Promise<Record<string, any>> => {
      if (quoteToken && marginToken) {
        const data = await getCurrentPositionsAmount(quoteToken, marginToken)
        return data?.data ?? {}
      }
      return {}
    },
    {
      retry: 0,
      initialData: {},
      refetchInterval: 5000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  if (!isEmpty(data)) return { refetch, data }

  return { refetch }
}
