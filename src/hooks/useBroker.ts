import { Signer } from 'ethers'
import { isEmpty } from 'lodash'
import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'

import tokens from '@/config/tokens'
import contracts from '@/config/contracts'
import { estimateGas } from '@/utils/estimateGas'
import { allowanceApprove } from '@/utils/allowanceApprove'
import { useQueryMulticall } from '@/hooks/useQueryContract'
import { getDerifyProtocolContract, getDerifyRewardsContract } from '@/utils/contractHelpers'
import { bnDiv, bnMul, formatUnits, inputParameterConversion } from '@/utils/tools'

import DerifyProtocolAbi from '@/config/abi/DerifyProtocol.json'

const init = {
  drfRewardBalance: '0',
  accumulatedDrfReward: '0',
  marginTokenRewardBalance: '0',
  accumulatedMarginTokenReward: '0'
}

export const useBrokerInfo = (trader = '', rewards = ''): { data: typeof init; isLoading: boolean } => {
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

export const useApplyBroker = () => {
  const applyBroker = async (burnLimitAmount: string, signer: Signer): Promise<boolean> => {
    // console.info(s)
    if (!signer) return false

    const c = getDerifyProtocolContract(signer)
    const _burnLimitAmount = inputParameterConversion(burnLimitAmount, 18)

    try {
      const approve = await allowanceApprove(
        signer,
        contracts.derifyProtocol.contractAddress,
        tokens.edrf.tokenAddress,
        _burnLimitAmount
      )

      if (!approve) return false

      const response = await c.applyBroker()
      const receipt = await response.wait()

      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  return { applyBroker }
}

export const useExtendPeriod = () => {
  const extend = async (amount: string, signer: Signer): Promise<boolean> => {
    const c = getDerifyProtocolContract(signer)
    const _amount1 = inputParameterConversion(amount, 8)
    const _amount2 = inputParameterConversion(amount, 18)

    try {
      if (!signer) return false

      const approve = await allowanceApprove(
        signer,
        contracts.derifyProtocol.contractAddress,
        tokens.edrf.tokenAddress,
        _amount2
      )

      if (!approve) return false

      const gasLimit = await estimateGas(c, 'burnEdrfExtendValidPeriod', [_amount1], 2000)
      const response = await c.burnEdrfExtendValidPeriod(_amount1, { gasLimit })
      const receipt = await response.wait()

      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  return { extend }
}

export const useBrokerParams = (): { data?: Record<string, any>; isLoading: boolean } => {
  const calls = [
    {
      name: 'brokerApplyNumber',
      address: contracts.derifyProtocol.contractAddress
    },
    {
      name: 'brokerValidUnitNumber',
      address: contracts.derifyProtocol.contractAddress
    }
  ]

  const { data, isLoading } = useQueryMulticall(DerifyProtocolAbi, calls, 30000)

  if (!isLoading && !isEmpty(data)) {
    const [brokerApplyNumber, brokerValidUnitNumber] = data
    const mul = bnMul(String(brokerValidUnitNumber), 24 * 3600)
    return {
      data: {
        burnLimitAmount: formatUnits(String(brokerApplyNumber)),
        burnLimitPerDay: Math.ceil(bnDiv(mul, 3 * Math.pow(10, 8)) as any)
      },
      isLoading
    }
  }

  return { isLoading }
}

export const useWithdrawReward = () => {
  const withdraw = useCallback(async (signer: Signer, address: string): Promise<boolean> => {
    if (!signer) return false

    const c = getDerifyRewardsContract(address, signer)

    try {
      const response = await c.withdrawBrokerReward()
      const receipt = await response.wait()

      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }, [])

  return { withdraw }
}
