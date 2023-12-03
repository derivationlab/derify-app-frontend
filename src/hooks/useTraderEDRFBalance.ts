import { useQuery } from '@tanstack/react-query'
import { getTraderEDRFBalance } from 'derify-apis-v20'

export const useTraderEDRFBalance = (trader = '') => {
  const { data, isLoading } = useQuery(
    ['getTraderEDRFBalance'],
    async (): Promise<number> => {
      const { data } = await getTraderEDRFBalance<{ data: number }>(trader)
      return data
    },
    {
      retry: 0,
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, isLoading }
}
