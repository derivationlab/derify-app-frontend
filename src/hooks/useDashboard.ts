import { isEmpty } from 'lodash'

import multicall from '@/utils/multicall'
import { useQuery } from '@tanstack/react-query'
import { formatUnits } from '@/utils/tools'

import DerifyRewardsAbi from '@/config/abi/DerifyRewards.json'

export const useRankReward = (trader: string, rewards: string): { data?: Record<string, any>; isLoading: boolean } => {
  const { data, isLoading } = useQuery(
    ['DerifyRewards-getRankReward'],
    async () => {
      if (trader && rewards) {
        const calls = [
          {
            name: 'getRankReward',
            address: rewards,
            params: [trader]
          }
        ]
        return multicall(DerifyRewardsAbi, calls)
      }
      return []
    },
    {
      retry: false,
      refetchInterval: 3000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  if (!isLoading && !isEmpty(data)) {
    console.info(data)
    const [getRankReward] = data
    const { marginTokenBalance, marginTokenAccumulatedBalance, drfBalance, drfAccumulatedBalance } = getRankReward
    // console.info({
    //   drfBalance: formatUnits(String(drfBalance), 8),
    //   marginTokenBalance: formatUnits(String(marginTokenBalance), 8),
    //   drfAccumulatedBalance: formatUnits(String(drfAccumulatedBalance), 8),
    //   marginTokenAccumulatedBalance: formatUnits(String(marginTokenAccumulatedBalance), 8)
    // })
    return {
      data: {
        drfBalance: formatUnits(String(drfBalance), 8),
        marginTokenBalance: formatUnits(String(marginTokenBalance), 8),
        drfAccumulatedBalance: formatUnits(String(drfAccumulatedBalance), 8),
        marginTokenAccumulatedBalance: formatUnits(String(marginTokenAccumulatedBalance), 8)
      },
      isLoading
    }
  }

  return { isLoading }
}
