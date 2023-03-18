import { isEmpty } from 'lodash'
import { useSigner } from 'wagmi'
import { useCallback } from 'react'

import tokens from '@/config/tokens'
import multicall from '@/utils/multicall'
import { useQuery } from '@tanstack/react-query'
import { estimateGas, setAllowance } from '@/utils/practicalMethod'
import { formatUnits, inputParameterConversion } from '@/utils/tools'
import { getDerifyPmrContract, getDerifyRankContract, getDerifyBrokerRewardsContract } from '@/utils/contractHelpers'

import DerifyRewardsAbi from '@/config/abi/DerifyRewards.json'

export const useRankReward = (
  trader?: string,
  rewards?: string
): { data?: Record<string, any>; isLoading: boolean } => {
  console.info(`rewards:${rewards}`)
  console.info(`trader:${trader}`)
  console.info(`getRankReward()`)
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
      refetchInterval: 6000,
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

export const useAddGrant = () => {
  const { data: signer } = useSigner()

  const addGrantPlan = useCallback(
    async (type: string, address: string, amount: string, days1: number, days2: number): Promise<boolean> => {
      if (!signer) return false

      let c: any

      if (type === 'mining') {
        c = getDerifyPmrContract(address, signer)
      }
      if (type === 'awards') {
        c = getDerifyBrokerRewardsContract(address, signer)
      }
      if (type === 'rank') {
        c = getDerifyRankContract(address, signer)
      }

      const _amount = inputParameterConversion(amount, 18)

      try {
        const approve = await setAllowance(signer, address, tokens.drf.tokenAddress, _amount)

        if (!approve) return false

        const gasLimit = await estimateGas(c, 'addGrant', [_amount, days1, days2], 0)
        const res = await c.addGrant(_amount, days1, days2, { gasLimit })
        const receipt = await res.wait()
        return receipt.status
      } catch (e) {
        console.info(e)
        return false
      }
    },
    [signer]
  )

  return { addGrantPlan }
}
