import { useQuery } from '@tanstack/react-query'
import { getGrantPlanCount } from 'derify-apis-v22'

export const useGrantTotalCount = (marginToken: string) => {
  const { data } = useQuery(
    ['getGrantPlanCount'],
    async (): Promise<{ count: number }> => {
      const { data } = await getGrantPlanCount<{ data: { count: number } }>(marginToken)
      return data ?? { count: 0 }
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
