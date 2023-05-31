import { useQuery } from '@tanstack/react-query'

import { getPriceFeedContract } from '@/utils/contractHelpers'
import { formatUnits } from '@/utils/tools'

export const useMarginPrice = (priceFeed?: string) => {
  const enabled = !!priceFeed

  const { data } = useQuery(
    ['useMarginPrice'],
    async (): Promise<string> => {
      if (priceFeed) {
        const contract = getPriceFeedContract(priceFeed)
        const response = await contract.getMarginTokenPrice()
        return formatUnits(response, 8)
      }

      return '0'
    },
    {
      retry: 0,
      enabled,
      initialData: '0',
      refetchInterval: 10000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data }
}
