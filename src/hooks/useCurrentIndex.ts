import { useQuery } from '@tanstack/react-query'

import { getCurrentIndexDAT } from '@/api'

export const useCurrentIndex = () => {
  const { data, refetch } = useQuery(
    ['useCurrentIndex'],
    async () => {
      const { data } = await getCurrentIndexDAT()
      // console.info(data)
      return data
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
