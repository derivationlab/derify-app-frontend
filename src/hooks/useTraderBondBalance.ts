import { useQuery } from '@tanstack/react-query'

import { getTraderBondBalance } from '@/api'

export const useTraderBondBalance = (trader = '', address: string) => {
  const { data, isLoading } = useQuery(
    ['getTraderBondBalance'],
    async (): Promise<number> => {
      const data = await getTraderBondBalance(trader, address)
      return data?.data
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
