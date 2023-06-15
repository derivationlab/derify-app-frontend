import { useQuery } from '@tanstack/react-query'

import { getRewardsContract } from '@/utils/contractHelpers'
import { formatUnits } from '@/utils/tools'

const brokerInfoInit = {
  drfRewardBalance: '0',
  accumulatedDrfReward: '0',
  marginTokenRewardBalance: '0',
  accumulatedMarginTokenReward: '0'
}

export const useBrokerAssets = (trader = '', rewards = ''): { data: typeof brokerInfoInit; isLoading: boolean } => {
  const { data, isLoading } = useQuery(
    ['useBrokerInfo'],
    async () => {
      if (trader && rewards) {
        const c = getRewardsContract(rewards)

        const response = await c.getBrokerReward(trader)

        const { marginTokenRewardBalance, drfRewardBalance, accumulatedDrfReward, accumulatedMarginTokenReward } =
          response
        return {
          ...brokerInfoInit,
          drfRewardBalance: formatUnits(drfRewardBalance),
          accumulatedDrfReward: formatUnits(accumulatedDrfReward),
          marginTokenRewardBalance: formatUnits(marginTokenRewardBalance),
          accumulatedMarginTokenReward: formatUnits(accumulatedMarginTokenReward)
        }
      }
      return brokerInfoInit
    },
    {
      retry: false,
      initialData: brokerInfoInit,
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, isLoading }
}
