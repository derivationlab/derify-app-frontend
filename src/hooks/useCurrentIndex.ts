import { useQuery } from '@tanstack/react-query'

import { get } from '@/utils/http'

export const useCurrentIndex = () => {
  const { data, refetch } = useQuery(
    ['useCurrentIndex'],
    async () => {
      const { data } = await get('https://api.derify.exchange/api/current_index_data')
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
