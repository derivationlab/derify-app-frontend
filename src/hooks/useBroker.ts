import { Signer } from 'ethers'
import { isEmpty } from 'lodash'
import { useSigner } from 'wagmi'
import { useCallback } from 'react'

import tokens from '@/config/tokens'
import contracts from '@/config/contracts'
import { allowanceApprove } from '@/utils/allowanceApprove'
import { useQueryMulticall } from '@/hooks/useQueryContract'
import { getDerifyProtocolContract, getDerifyRewardsContract } from '@/utils/contractHelpers'
import { bnDiv, bnMul, formatUnits, inputParameterConversion } from '@/utils/tools'

import DerifyProtocolAbi from '@/config/abi/DerifyProtocol.json'

export const useApplyBroker = () => {
  const { data: s } = useSigner()
  const applyBroker = useCallback(
    async (burnLimitAmount: string, signer: Signer): Promise<boolean> => {
      // console.info(s)
      if (!signer) return false

      const c = getDerifyProtocolContract(signer)
      const _burnLimitAmount = inputParameterConversion(burnLimitAmount, 8)

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
    },
    [s]
  )

  return { applyBroker }
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

export const useExtendPeriod = () => {
  const extend = async (amount: string, signer: Signer): Promise<boolean> => {
    const c = getDerifyProtocolContract(signer)
    const _amount = inputParameterConversion(amount, 8)

    try {
      if (!signer) return false

      const approve = await allowanceApprove(
        signer,
        contracts.derifyProtocol.contractAddress,
        tokens.edrf.tokenAddress,
        amount
      )

      if (!approve) return false

      const response = await c.burnEdrfExtendValidPeriod(_amount)
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
