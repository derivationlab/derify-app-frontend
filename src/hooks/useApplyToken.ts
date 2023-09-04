import contracts from '@/config/contracts'
import tokens from '@/config/tokens'
import { TokenKeys, TSigner } from '@/typings'
import { allowanceApprove } from '@/utils/allowanceApprove'
import { getApplyTokenContract } from '@/utils/contractHelpers'
import { inputParameterConversion } from '@/utils/tools'

interface ApplyNewMarginTokenParams {
  marginToken: string
  paymentToken: TokenKeys
  paymentAmount: string
  advisorAddress: string
  signer: TSigner
}

interface ApplyNewTradingTokenParams {
  marginToken: string
  tradingToken: string
  paymentToken: TokenKeys
  paymentAmount: string
  signer: TSigner
}

export const useApplyToken = () => {
  const applyNewMarginToken = async (params: ApplyNewMarginTokenParams): Promise<boolean> => {
    const { signer, marginToken, paymentToken, paymentAmount, advisorAddress } = params
    const { precision, tokenAddress } = tokens[paymentToken]
    if (!signer) return false
    const contract = getApplyTokenContract(signer)
    const amount = inputParameterConversion(paymentAmount, precision)
    try {
      const approve = await allowanceApprove(signer, contracts.derifyApply.contractAddress, tokenAddress, amount)
      if (!approve) return false
      const response = await contract.addInsurance(marginToken, tokenAddress, paymentAmount, advisorAddress)
      const receipt = await response.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  const applyNewTradingToken = async (params: ApplyNewTradingTokenParams): Promise<boolean> => {
    const { signer, marginToken, tradingToken, paymentToken, paymentAmount } = params
    const { precision, tokenAddress } = tokens[paymentToken]
    if (!signer) return false
    const contract = getApplyTokenContract(signer)
    const amount = inputParameterConversion(paymentAmount, precision)
    try {
      const approve = await allowanceApprove(signer, contracts.derifyApply.contractAddress, tokenAddress, amount)
      if (!approve) return false
      const response = await contract.applySpotToken(marginToken, tradingToken, tokenAddress, paymentAmount)
      const receipt = await response.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  return {
    applyNewMarginToken,
    applyNewTradingToken
  }
}
