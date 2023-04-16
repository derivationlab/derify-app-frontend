import { useQuery } from '@tanstack/react-query'

import { formatUnits } from '@/utils/tools'
import { PLATFORM_TOKEN } from '@/config/tokens'
import { getDerifyPmrContract, getDerifyRankContract, getDerifyBrokerRewardsContract } from '@/utils/contractHelpers'

export const useMinimumGrant = ({ rank = '', awards = '', mining = '' } = {}) => {
  const { data, refetch, isLoading } = useQuery(
    ['useMinimumGrant'],
    async () => {
      if (rank && awards && mining) {
        const c1 = getDerifyPmrContract(mining)
        const c2 = getDerifyRankContract(rank)
        const c3 = getDerifyBrokerRewardsContract(awards)

        const res1 = await c1.minGrantAmount()
        const res2 = await c2.minGrantAmount()
        const res3 = await c3.minGrantAmount()

        return [
          formatUnits(res1, PLATFORM_TOKEN.precision),
          formatUnits(res2, PLATFORM_TOKEN.precision),
          formatUnits(res3, PLATFORM_TOKEN.precision)
        ]
      }
      return ['0', '0', '0']
    },
    {
      retry: false,
      initialData: ['0', '0', '0'],
      refetchInterval: 60000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch, isLoading }
}
