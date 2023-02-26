import { useQuery } from 'react-query'

import { getCurrentPositionsAmount } from '@/api'

export const useCurrentPositionsAmount = (quoteToken: string, marginToken: string) => {
  // console.info(marginToken)
  const query = useQuery(
    ['getCurrentPositionsAmount'],
    async (): Promise<Record<string, any>> => {
      const data = await getCurrentPositionsAmount(quoteToken, marginToken)
      console.info(data)
      return data
    },
    {
      retry: 0,
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    },
  )

  return query
}
