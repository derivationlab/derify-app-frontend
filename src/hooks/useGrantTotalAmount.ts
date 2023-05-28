import { useQuery } from '@tanstack/react-query'

import { getGrantPlanAmount } from '@/api'

export const useGrantTotalAmount = (marginToken: string) => {
  const { data } = useQuery(
    ['getGrantPlanAmount'],
    async (): Promise<{ totalAmount: number }> => {
      const data = await getGrantPlanAmount(marginToken)
      return data?.data ?? { totalAmount: 10 }
    },
    {
      retry: 0,
      initialData: { totalAmount: 0 },
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data }
}