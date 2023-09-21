import { useQuery } from '@tanstack/react-query'
import { getGrantPlanAmount } from 'derify-apis-test'

export const useGrantTotalAmount = (marginToken: string) => {
  const { data } = useQuery(
    ['getGrantPlanAmount'],
    async (): Promise<{ totalAmount: number }> => {
      const { data } = await getGrantPlanAmount<{ data: { totalAmount: number } }>(marginToken)
      return data ?? { totalAmount: 10 }
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
