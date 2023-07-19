import { useCallback } from 'react'

import contracts from '@/config/contracts'
import tokens from '@/config/tokens'
import { TSigner } from '@/typings'
import { allowanceApprove } from '@/utils/allowanceApprove'
import { getProtocolContract, getRewardsContract } from '@/utils/contractHelpers'
import { estimateGas } from '@/utils/estimateGas'
import { inputParameterConversion } from '@/utils/tools'

export const useBrokerOperation = () => {
  const applyBroker = async (burnLimitAmount: string, signer: TSigner): Promise<boolean> => {
    // console.info(s)
    if (!signer) return false

    const c = getProtocolContract(signer)
    const burnLimitAmountPrecision18 = inputParameterConversion(burnLimitAmount, 18)

    try {
      const approve = await allowanceApprove(
        signer,
        contracts.derifyProtocol.contractAddress,
        tokens.edrf.tokenAddress,
        burnLimitAmountPrecision18
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

  const withdrawBrokerReward = useCallback(async (signer: TSigner, address: string | undefined): Promise<boolean> => {
    if (!signer || !address) return false

    const c = getRewardsContract(address, signer)

    try {
      const response = await c.withdrawBrokerReward()
      const receipt = await response.wait()

      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }, [])

  const extendBrokerPrivilegesValidityPeriod = async (amount: string, signer: TSigner): Promise<boolean> => {
    const c = getProtocolContract(signer)
    const amountPrecision8 = inputParameterConversion(amount, 8)
    const amountPrecision18 = inputParameterConversion(amount, 18)

    try {
      if (!signer) return false

      const approve = await allowanceApprove(
        signer,
        contracts.derifyProtocol.contractAddress,
        tokens.edrf.tokenAddress,
        amountPrecision18
      )

      if (!approve) return false

      const gasLimit = await estimateGas(c, 'burnEdrfExtendValidPeriod', [amountPrecision8], 2000)
      const response = await c.burnEdrfExtendValidPeriod(amountPrecision8, { gasLimit })
      const receipt = await response.wait()

      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  return { applyBroker, withdrawBrokerReward, extendBrokerPrivilegesValidityPeriod }
}
