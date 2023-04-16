import { Contract } from 'ethers'
import { useSigner } from 'wagmi'
import { useCallback } from 'react'

import tokens from '@/config/tokens'
import { useQuery } from '@tanstack/react-query'
import { estimateGas, setAllowance } from '@/utils/practicalMethod'
import { formatUnits, inputParameterConversion } from '@/utils/tools'
import {
  getDerifyPmrContract,
  getDerifyRankContract,
  getDerifyRewardsContract,
  getDerifyBrokerRewardsContract
} from '@/utils/contractHelpers'

export const useRankReward = (trader?: string, rewards?: string) => {
  const output = { drfBalance: '0', drfAccumulatedBalance: '0' }
  const { data, refetch, isLoading } = useQuery(
    ['useRankReward'],
    async () => {
      if (trader && rewards) {
        const c = getDerifyRewardsContract(rewards)

        const response = await c.getRankReward(trader)

        const { drfBalance, drfAccumulatedBalance } = response

        return {
          ...output,
          drfBalance: formatUnits(String(drfBalance), 8),
          drfAccumulatedBalance: formatUnits(String(drfAccumulatedBalance), 8)
        }
      }
      return output
    },
    {
      retry: false,
      // initialData: output,
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

      let c: unknown

      if (type === 'rank') {
        c = getDerifyRankContract(address, signer)
      }
      if (type === 'mining') {
        c = getDerifyPmrContract(address, signer)
      }
      if (type === 'awards') {
        c = getDerifyBrokerRewardsContract(address, signer)
      }

      const _amount = inputParameterConversion(amount, 18)

      try {
        const approve = await setAllowance(signer, address, tokens.drf.tokenAddress, _amount)

        if (!approve) return false

        const gasLimit = await estimateGas(c as Contract, 'addGrant', [_amount, days1, days2])
        const res = await (c as Contract).addGrant(_amount, days1, days2, { gasLimit })
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
