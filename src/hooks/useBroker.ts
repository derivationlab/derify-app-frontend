import { Signer } from 'ethers'
import { isEmpty } from 'lodash'
import { useCallback } from 'react'

import tokens from '@/config/tokens'
import { setAllowance } from '@/utils/practicalMethod'
import { useQueryMulticall } from '@/hooks/useQueryContract'
import { getDerifyBrokerAddress } from '@/utils/addressHelpers'
import { getDerifyBrokerContract } from '@/utils/contractHelpers'
import { bnDiv, bnMul, formatUnits, inputParameterConversion } from '@/utils/tools'

import DerifyBrokerAbi from '@/config/abi/DerifyBroker.json'

export const useApplyBroker = () => {
  const applyBroker = useCallback(async (burnLimitAmount: string, signer: Signer): Promise<boolean> => {
    if (!signer) return false

    const c = getDerifyBrokerContract(signer)
    const _burnLimitAmount = inputParameterConversion(burnLimitAmount, 8)

    try {
      const approve = await setAllowance(signer, getDerifyBrokerAddress(), tokens.edrf.tokenAddress, _burnLimitAmount)

      if (!approve) return false

      const response = await c.applyBroker()
      const receipt = await response.wait()

      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }, [])

  return { applyBroker }
}

export const useWithdrawReward = () => {
  const withdraw = useCallback(async (signer: Signer): Promise<boolean> => {
    if (!signer) return false

    const c = getDerifyBrokerContract(signer)

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
  const extend = useCallback(async (amount: string, signer: Signer): Promise<boolean> => {
    const c = getDerifyBrokerContract(signer)
    const _amount = inputParameterConversion(amount, 8)

    try {
      const approve = await setAllowance(signer, getDerifyBrokerAddress(), tokens.edrf.tokenAddress, amount)

      if (!approve) return false

      const response = await c.burnEdrfExtendValidPeriod(_amount)
      const receipt = await response.wait()

      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }, [])

  return { extend }
}

export const useBrokerParams = (): { data?: Record<string, any>; isLoading: boolean } => {
  const calls = [
    {
      name: 'brokerApplyNumber',
      address: getDerifyBrokerAddress()
    },
    {
      name: 'brokerValidUnitNumber',
      address: getDerifyBrokerAddress()
    }
  ]

  const { data, isLoading } = useQueryMulticall(DerifyBrokerAbi, calls, 30000)

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
