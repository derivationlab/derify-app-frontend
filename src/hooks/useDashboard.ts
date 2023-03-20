import { useSigner } from 'wagmi'
import { useCallback } from 'react'

import tokens from '@/config/tokens'
import { useQuery } from '@tanstack/react-query'
import { estimateGas, setAllowance } from '@/utils/practicalMethod'
import { formatUnits, inputParameterConversion } from '@/utils/tools'
import {
  getDerifyPmrContract,
  getDerifyRankContract,
  getDerifyBrokerRewardsContract,
  getDerifyRewardsContract
} from '@/utils/contractHelpers'

export const useRankReward = (trader?: string, rewards?: string) => {
  let output = { drfBalance: '0', drfAccumulatedBalance: '0' }
  const { data, refetch, isLoading } = useQuery(
    ['useRankReward'],
    async () => {
      if (trader && rewards) {
        const c = getDerifyRewardsContract(rewards)

        const response = await c.getRankReward(trader)

        const { drfBalance, drfAccumulatedBalance } = response

        return {
          drfBalance: formatUnits(String(drfBalance), 8),
          drfAccumulatedBalance: formatUnits(String(drfAccumulatedBalance), 8)
        }
      }
      return output
    },
    {
      retry: false,
      initialData: output,
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, refetch, isLoading }
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
