import { useQuery } from '@tanstack/react-query'

import { getGrantPlanCount } from '@/api'

export const useGrantTotalCount = (marginToken: string) => {
  const { data } = useQuery(
    ['getGrantPlanCount'],
    async (): Promise<{ count: number }> => {
      const data = await getGrantPlanCount(marginToken)
      return data?.data ?? { count: 0 }
    },
    {
      retry: 0,
      initialData: { count: 0 },
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data }
}
