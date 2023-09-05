import { useMemo } from 'react'

import contracts from '@/config/contracts'
import tokens, { findToken } from '@/config/tokens'
import { usePlatformTokenPrice } from '@/hooks/usePlatformTokenPrice'
import { paymentTypeOptions } from '@/pages/web/userApply/PaymentOptions'
import { TokenKeys, TSigner } from '@/typings'
import { allowanceApprove } from '@/utils/allowanceApprove'
import { getApplyTokenContract } from '@/utils/contractHelpers'
import { inputParameterConversion, keepDecimals } from '@/utils/tools'

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
    const { precision, tokenAddress } = findToken(paymentToken)
    if (!signer) return false
    const contract = getApplyTokenContract(signer)
    const amount = inputParameterConversion(paymentAmount, precision)
    try {
      const approve = await allowanceApprove(signer, contracts.derifyApply.contractAddress, tokenAddress, amount)
      if (!approve) return false
      const response = await contract.addInsurance(marginToken, tokenAddress, amount, advisorAddress)
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
      const response = await contract.applySpotToken(marginToken, tradingToken, tokenAddress, amount)
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

export const usePaymentAmount = (token: string, base: number) => {
  const { data: tokenPrice } = usePlatformTokenPrice()

  return useMemo(() => {
    const target = paymentTypeOptions.find((l) => l.val === token)
    switch (target?.key) {
      case 'USDT':
        return base
      case 'DRF':
        const _ = Number(tokenPrice)
        return _ === 0 ? 0 : keepDecimals((base * 0.9) / _, 2)
      default:
        throw new Error(`Unknown payment token: ${token}`)
    }
  }, [token, tokenPrice])
}
