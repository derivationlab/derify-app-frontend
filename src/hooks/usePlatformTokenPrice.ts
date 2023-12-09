import { useQuery } from '@tanstack/react-query'
import { getPlatformTokenPrice } from 'derify-apis'

import { nonBigNumberInterception } from '@/utils/tools'

export const usePlatformTokenPrice = () => {
  const { data } = useQuery(
    ['usePlatformTokenPrice'],
    async (): Promise<string> => {
      const { data } = await getPlatformTokenPrice<{ data: string }>()
      return nonBigNumberInterception(data, 4)
    },
    {
      retry: 0,
      initialData: '0',
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data }
}
