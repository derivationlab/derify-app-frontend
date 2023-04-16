import { useQuery } from '@tanstack/react-query'

import { formatUnits } from '@/utils/tools'
import { getDerifyRewardsContract } from '@/utils/contractHelpers'

const init = {
  drfRewardBalance: '0',
  accumulatedDrfReward: '0',
  marginTokenRewardBalance: '0',
  accumulatedMarginTokenReward: '0'
}

export const useBrokerInfo = (trader = '', rewards = ''): { data: Record<string, any>; isLoading: boolean } => {
  const { data, isLoading } = useQuery(
    ['useRankReward'],
    async () => {
      if (trader && rewards) {
        const c = getDerifyRewardsContract(rewards)

        const response = await c.getBrokerReward(trader)

        const { marginTokenRewardBalance, drfRewardBalance, accumulatedDrfReward, accumulatedMarginTokenReward } =
          response
        return {
          ...init,
          drfRewardBalance: formatUnits(drfRewardBalance),
          accumulatedDrfReward: formatUnits(accumulatedDrfReward),
          marginTokenRewardBalance: formatUnits(marginTokenRewardBalance),
          accumulatedMarginTokenReward: formatUnits(accumulatedMarginTokenReward)
        }
      }
      return init
    },
    {
      retry: false,
      initialData: init,
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, isLoading }
}
