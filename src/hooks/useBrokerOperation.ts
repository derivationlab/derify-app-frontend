import { Signer } from 'ethers'

import { useCallback } from 'react'

import contracts from '@/config/contracts'
import tokens from '@/config/tokens'
import { allowanceApprove } from '@/utils/allowanceApprove'
import { getDerifyProtocolContract, getDerifyRewardsContract } from '@/utils/contractHelpers'
import { estimateGas } from '@/utils/estimateGas'
import { inputParameterConversion } from '@/utils/tools'

export const useBrokerOperation = () => {
  const applyBroker = async (burnLimitAmount: string, signer: Signer): Promise<boolean> => {
    // console.info(s)
    if (!signer) return false

    const c = getDerifyProtocolContract(signer)
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

  const withdrawBrokerReward = useCallback(async (signer: Signer, address: string): Promise<boolean> => {
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

  const burnEdrfExtendValidPeriod = async (amount: string, signer: Signer): Promise<boolean> => {
    const c = getDerifyProtocolContract(signer)
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

  return { applyBroker, withdrawBrokerReward, burnEdrfExtendValidPeriod }
}
