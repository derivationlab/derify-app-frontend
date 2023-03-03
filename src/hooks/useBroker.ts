import { isEmpty } from 'lodash'
import { useSigner } from 'wagmi'
import { useParams } from 'react-router-dom'
import { useCallback, useMemo } from 'react'

import { OpeningType } from '@/zustand/useCalcOpeningDAT'
import { calcProfitOrLoss } from '@/hooks/helper'
import {
  bnDiv,
  bnMul,
  formatUnits,
  getDecimalAmount,
  inputParameterConversion,
  nonBigNumberInterception
} from '@/utils/tools'
import { OrderTypes, PositionSide } from '@/store/contract/helper'
import { estimateGas, setAllowance } from '@/utils/practicalMethod'
import tokens, { BASE_TOKEN_SYMBOL, findMarginToken, findToken, MARGIN_TOKENS } from '@/config/tokens'
import {
  getDerifyBrokerContract,
  getDerifyDerivativePairContract,
  getDerifyExchangeContract1
} from '@/utils/contractHelpers'
import { getAddress, getDerifyBrokerAddress, getDerifyProtocolAddress } from '@/utils/addressHelpers'
import { MarginTokenWithContract } from '@/typings'
import { useQueryMulticall } from '@/hooks/useQueryContract'
import DerifyBrokerAbi from '@/config/abi/DerifyBroker.json'
import { initial } from '@/hooks/useProtocolConfig'
import { Signer } from 'ethers'

export const useApplyBroker = () => {
  const { data: signer } = useSigner()

  const applyBroker = useCallback(
    async (burnLimitAmount: string): Promise<boolean> => {
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
    },
    [signer]
  )

  return { applyBroker }
}

export const useWithdrawReward = () => {
  const { data: signer } = useSigner()

  const withdraw = useCallback(async (): Promise<boolean> => {
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
  }, [signer])

  return { withdraw }
}

export const useExtendPeriod = () => {
  const { data: signer } = useSigner()

  const extend = useCallback(
    async (amount: string): Promise<boolean> => {
      if (!signer) return false

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
    },
    [signer]
  )

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
