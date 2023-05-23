import { useQuery } from '@tanstack/react-query'
import { isEmpty } from 'lodash'

import { getCurrentTradingAmount } from '@/api'

export const useCurrentTrading = (address: string, marginToken: string) => {
  const { data, refetch } = useQuery(
    ['useCurrentTradingAmount'],
    async (): Promise<any[]> => {
      if (address && marginToken) {
        const data = await getCurrentTradingAmount(address, marginToken)
        return data?.data
      }
      return []
    },
    {
      retry: 0,
      initialData: [],
      refetchInterval: 5000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  if (!isEmpty(data)) return { refetch, data }

  return { refetch }
}
