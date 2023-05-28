import { useQuery } from '@tanstack/react-query'

import { getPlatformTokenPrice } from '@/api'

export const usePlatformTokenPrice = () => {
  const { data } = useQuery(
    ['usePlatformTokenPrice'],
    async (): Promise<number> => {
      const { data } = await getPlatformTokenPrice()
      return data
    },
    {
      retry: 0,
      initialData: 0,
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data }
}
