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
export const useCurrentOpenInterest = (quoteTokenAddress: string, marginTokenAddress: string) => {
  const { data, refetch } = useQuery(
    ['useCurrentOpenInterest'],
    async () => {
      const data = await getCurrentPositionsAmount(quoteTokenAddress, marginTokenAddress)
      return data?.data
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
