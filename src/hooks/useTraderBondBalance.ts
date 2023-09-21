import { useQuery } from '@tanstack/react-query'
import { getTraderBondBalance } from 'derify-apis-test'

export const useTraderBondBalance = (trader = '', address: string) => {
  const { data, isLoading } = useQuery(
    ['getTraderBondBalance'],
    async (): Promise<number> => {
      const { data } = await getTraderBondBalance<{ data: number }>(trader, address)
      return data
    },
    {
      retry: 0,
      // initialData: 0,
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, isLoading }
}
