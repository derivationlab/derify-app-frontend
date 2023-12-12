import { useQuery } from '@tanstack/react-query'
import { getGrantPlanRatios } from 'derify-apis-staging'

export const useGrantRatios = (marginToken: string, trader?: string) => {
  const { data } = useQuery(
    ['getGrantPlanRatios'],
    async (): Promise<number> => {
      if (trader) {
        const { data } = await getGrantPlanRatios<{ data: number[] }>(marginToken, trader)

        const _data = data ?? []

        return _data.length > 0 ? Math.min.apply(null, _data) : 0
      }

      return 0
    },
    {
      retry: 0,
      initialData: 0,
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data }
}
