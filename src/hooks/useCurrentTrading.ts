import { useQuery } from '@tanstack/react-query'
import { getCurrentTradingAmount } from 'derify-apis'
import { isEmpty } from 'lodash-es'

import { Rec } from '@/typings'

export const useCurrentTrading = (address: string, marginToken: string) => {
  const { data, refetch } = useQuery(
    ['useCurrentTradingAmount'],
    async (): Promise<Rec[]> => {
      if (address && marginToken) {
        const { data } = await getCurrentTradingAmount<{ data: Rec[] }>(address, marginToken)
        return data
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
