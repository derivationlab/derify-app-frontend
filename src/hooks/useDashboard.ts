import { useQuery } from '@tanstack/react-query'
import { Contract } from 'ethers'
import { isEmpty } from 'lodash-es'
import { useSigner } from 'wagmi'

import { useCallback } from 'react'

import derifyProtocolAbi from '@/config/abi/DerifyProtocol.json'
import contracts from '@/config/contracts'
import tokens from '@/config/tokens'
import { allowanceApprove } from '@/utils/allowanceApprove'
import { getMiningContract, getRankingContract, getRewardsContract, getBrokerContract } from '@/utils/contractHelpers'
import { estimateGas } from '@/utils/estimateGas'
import multicall from '@/utils/multicall'
import { formatUnits, inputParameterConversion } from '@/utils/tools'

export const useAddGrant = () => {
  const { data: signer } = useSigner()

  const addGrantPlan = useCallback(
    async (type: string, address: string, amount: string, days1: number, days2: number): Promise<boolean> => {
      if (!signer) return false

      let c: unknown

      if (type === 'rank') {
        c = getRankingContract(address, signer)
      }
      if (type === 'mining') {
        c = getMiningContract(address, signer)
      }
      if (type === 'awards') {
        c = getBrokerContract(address, signer)
      }

      const _amount = inputParameterConversion(amount, 18)

      try {
        const approve = await allowanceApprove(signer, address, tokens.drf.tokenAddress, _amount)

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

export const useRankReward = (trader?: string, config?: string) => {
  const output = { drfBalance: '0', drfAccumulatedBalance: '0' }
  const { data, refetch, isLoading } = useQuery(
    ['useRankReward'],
    async () => {
      if (trader && config) {
        const c = getRewardsContract(config)

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

let outputInit = Object.create(null)

export const useBuyBackPool = (list?: string[]) => {
  const { data, isLoading } = useQuery(
    ['useBuyBackPool'],
    async () => {
      if (list && list.length) {
        const calls = list.map((address) => ({
          name: 'getAllSysExchangeBondSizeUpperBounds',
          params: [[address]],
          address: contracts.derifyProtocol.contractAddress,
          marginToken: address
        }))

        const response = await multicall(derifyProtocolAbi, calls)

        if (!isEmpty(response)) {
          response.forEach(([data]: any, index: number) => {
            outputInit = {
              ...outputInit,
              [calls[index].marginToken]: formatUnits(String(data[0]), 8)
            }
          })

          // console.info(output)
          return outputInit
        }
      }

      return null
    },
    {
      retry: false,
      initialData: null,
      refetchInterval: 6000,
      keepPreviousData: true,
      refetchOnWindowFocus: false
    }
  )

  return { data, isLoading }
}
