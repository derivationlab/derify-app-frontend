import { useQuery } from '@tanstack/react-query'
import { getCurrentIndexDAT } from 'derify-apis-test'

import { Rec } from '@/typings'

export const useCurrentIndex = (marginToken: string) => {
  const { data, refetch } = useQuery(
    ['useCurrentIndex'],
    async () => {
      const data = await getCurrentIndexDAT<{ data: Rec }>(marginToken)
      return data?.data ?? {}
    },
    {
      retry: 0,
      initialData: null,
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch }
}
