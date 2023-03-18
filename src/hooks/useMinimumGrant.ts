import { useQuery } from '@tanstack/react-query'

import { safeInterceptionValues } from '@/utils/tools'
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
          safeInterceptionValues(res1, 18, 18),
          safeInterceptionValues(res2, 18, 18),
          safeInterceptionValues(res3, 18, 18)
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
