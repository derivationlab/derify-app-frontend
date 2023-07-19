import { useQuery } from '@tanstack/react-query'

import { getCurrentPositionsAmount } from '@/api'

/**
 {
    "long_position_amount": 357872.77150539,
    "short_position_amount": 313665.67597882
}
 * @param quoteTokenAddress
 * @param marginTokenAddress
 */
export const useCurrentPositionsTotalAmount = (quoteTokenAddress: string, marginTokenAddress: string) => {
  const { data, refetch } = useQuery(
    ['useCurrentPositionsTotalAmount'],
    async () => {
      if (quoteTokenAddress) {
        const { data } = await getCurrentPositionsAmount(quoteTokenAddress, marginTokenAddress)
        return data ?? null
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
