import { useQuery } from '@tanstack/react-query'

import { getRewardsContract } from '@/utils/contractHelpers'
import { formatUnits } from '@/utils/tools'

const brokerInfoInit = {
  drfRewardBalance: '0',
  accumulatedDrfReward: '0',
  marginTokenRewardBalance: '0',
  accumulatedMarginTokenReward: '0'
}

type Common = string | undefined

export const useBrokerAssets = (trader: Common, rewards: Common) => {
  const { data: brokerAssets, isLoading } = useQuery(
    ['useBrokerAssets'],
    async () => {
      if (!trader || !rewards) return brokerInfoInit
      const contract = getRewardsContract(rewards)
      const response = await contract.getBrokerReward(trader)
      const { marginTokenRewardBalance, drfRewardBalance, accumulatedDrfReward, accumulatedMarginTokenReward } =
        response
      return {
        ...brokerInfoInit,
        drfRewardBalance: formatUnits(drfRewardBalance),
        accumulatedDrfReward: formatUnits(accumulatedDrfReward),
        marginTokenRewardBalance: formatUnits(marginTokenRewardBalance),
        accumulatedMarginTokenReward: formatUnits(accumulatedMarginTokenReward)
      }
    },
    {
      retry: false,
      initialData: brokerInfoInit,
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { brokerAssets, isLoading }
}
