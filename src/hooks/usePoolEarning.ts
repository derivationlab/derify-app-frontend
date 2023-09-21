import { useQuery } from '@tanstack/react-query'
import { isEmpty } from 'lodash-es'

import DerifyRewardsAbi from '@/config/abi/DerifyRewards.json'
import { Rec } from '@/typings'
import multicall from '@/utils/multicall'
import { formatUnits } from '@/utils/tools'

export const getPoolEarning = async (trader: string, reward: string): Promise<Rec> => {
  let output = {}
  const calls = [
    {
      name: 'getPositionReward',
      address: reward,
      params: [trader]
    },
    {
      name: 'getBondInfo',
      address: reward,
      params: [trader]
    },
    {
      name: 'getExchangeBondSizeUpperBound',
      address: reward,
      params: [trader]
    },
    {
      name: 'bankBondPool',
      address: reward
    }
  ]

  const response = await multicall(DerifyRewardsAbi, calls)

  if (!isEmpty(response)) {
    const [getPositionReward, getBondInfo, getExchangeBondSizeUpperBound, bankBondPool] = response

    const [bankBalance] = bankBondPool
    const { maxBondSize } = getExchangeBondSizeUpperBound
    const { bondAnnualInterestRatio, bondBalance, bondReturnBalance, bondWalletBalance } = getBondInfo
    const { drfAccumulatedBalance, drfBalance, marginTokenAccumulatedBalance, marginTokenBalance } = getPositionReward

    output = {
      drfBalance: formatUnits(String(drfBalance), 8),
      bankBalance: formatUnits(String(bankBalance), 8),
      bondBalance: formatUnits(String(bondBalance), 8),
      exchangeable: formatUnits(String(maxBondSize), 8),
      bondReturnBalance: formatUnits(String(bondReturnBalance), 8),
      bondWalletBalance: formatUnits(String(bondWalletBalance), 8),
      marginTokenBalance: formatUnits(String(marginTokenBalance), 8),
      drfAccumulatedBalance: formatUnits(String(drfAccumulatedBalance), 8),
      bondAnnualInterestRatio: formatUnits(String(bondAnnualInterestRatio), 8),
      marginTokenAccumulatedBalance: formatUnits(String(marginTokenAccumulatedBalance), 8)
    }

    // console.info(output)
    return output
  }

  return output
}

export const usePoolEarning = (trader?: string, rewards?: string) => {
  const { data } = useQuery(
    ['usePoolEarning'],
    async () => {
      if (rewards && trader) {
        const data = await getPoolEarning(trader, rewards)
        return data
      }
      return null
    },
    {
      retry: 0,
      initialData: null,
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data }
}
