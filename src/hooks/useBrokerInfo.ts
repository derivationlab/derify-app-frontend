import { useQuery } from '@tanstack/react-query'

import { getDerifyProtocolContract, getDerifyRewardsContract } from '@/utils/contractHelpers'
import { formatUnits } from '@/utils/tools'

const init = {
  isBroker: false,
  drfRewardBalance: '0',
  validPeriodInBlocks: 0,
  accumulatedDrfReward: '0',
  marginTokenRewardBalance: '0',
  accumulatedMarginTokenReward: '0'
}

export const useBrokerInfoFromC = (trader = '', rewards = ''): { data: Record<string, any>; isLoading: boolean } => {
  const { data, isLoading } = useQuery(
    ['useRankReward'],
    async () => {
      if (trader && rewards) {
        const c1 = getDerifyProtocolContract()
        const c2 = getDerifyRewardsContract(rewards)

        const res1 = await c1.getBrokerInfo(trader)
        const res2 = await c2.getBrokerReward(trader)

        const { validPeriodInBlocks } = res1
        const { marginTokenRewardBalance, drfRewardBalance, accumulatedDrfReward, accumulatedMarginTokenReward } = res2
        // console.info({
        //   isBroker: true,
        //   marginTokenRewardBalance: formatUnits(marginTokenRewardBalance),
        //   drfRewardBalance: formatUnits(drfRewardBalance),
        //   validPeriodInBlocks: Number(validPeriodInBlocks),
        //   accumulatedDrfReward: formatUnits(accumulatedDrfReward),
        //   accumulatedMarginTokenReward: formatUnits(accumulatedMarginTokenReward)
        // })
        return {
          ...init,
          isBroker: true,
          drfRewardBalance: formatUnits(drfRewardBalance),
          validPeriodInBlocks: Number(validPeriodInBlocks),
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
