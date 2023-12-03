import { getDerivativeList, getTradingTokenList } from 'derify-apis-v20'

import { useEffect, useMemo, useState } from 'react'

import contracts from '@/config/contracts'
import { findToken } from '@/config/tokens'
import { usePlatformTokenPrice } from '@/hooks/usePlatformTokenPrice'
import { paymentTypeOptions } from '@/pages/web/tokenApply/PaymentOptions'
import { Rec, TokenKeys, TSigner } from '@/typings'
import { allowanceApprove } from '@/utils/allowanceApprove'
import { getApplyTokenContract } from '@/utils/contractHelpers'
import { bnMul, inputParameterConversion, keepDecimals } from '@/utils/tools'

interface ApplyNewMarginTokenParams {
  marginToken: string
  paymentToken: TokenKeys
  paymentAmount: string
  advisorAddress: string
  signer: TSigner
}

interface ApplyNewTradingTokenParams {
  marginToken: string
  tradingToken: string[]
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
      const response = await contract.applyMarginToken(marginToken, tokenAddress, amount, advisorAddress)
      const receipt = await response.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  const applyNewTradingToken = async (params: ApplyNewTradingTokenParams): Promise<boolean> => {
    const { signer, marginToken, tradingToken, paymentToken, paymentAmount } = params
    const { precision, tokenAddress } = findToken(paymentToken)
    if (!signer) return false
    const contract = getApplyTokenContract(signer)
    const amount = inputParameterConversion(paymentAmount, precision)
    try {
      const approve = await allowanceApprove(signer, contracts.derifyApply.contractAddress, tokenAddress, amount)
      if (!approve) return false
      const response = await contract.applySpotTokens(marginToken, tradingToken, tokenAddress, amount)
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

export const usePaymentAmount = (token: string, base: number, count = 1) => {
  const { data: tokenPrice } = usePlatformTokenPrice()
  return useMemo(() => {
    if (!token) return ['0', '0']
    const target = paymentTypeOptions.find((l) => l.val === token)
    if (target?.key === 'USDT') {
      const total1 = bnMul(base, count)
      return [keepDecimals(total1, 2), total1]
    } else if (target?.key === 'DRF') {
      const price = Number(tokenPrice)
      const discount = price === 0 ? 0 : (base * 0.9) / price
      const total2 = bnMul(discount, count)
      return [keepDecimals(total2, 2), total2]
    } else {
      throw new Error(`Unknown payment token: ${token}`)
    }
  }, [count, token, tokenPrice])
}

export const useTradingList = (marginToken: string) => {
  const [tradingList, setTradingList] = useState<{ list: Rec[]; loaded: boolean }>({ list: [], loaded: true })

  const func = async (marginToken: string) => {
    setTradingList((val) => ({ ...val, list: [], loaded: true }))
    try {
      if (!marginToken) {
        setTradingList((val) => ({ ...val, list: [], loaded: false }))
      } else {
        const { data: data1 } = await getTradingTokenList<{ data: Rec }>()
        const { data: data2 = [] } = await getDerivativeList<{ data: Rec }>(marginToken)
        const _data2: Rec[] = data2?.records ?? []
        const filter = (data1?.records ?? []).filter((x: Rec) => !_data2.find((f) => f.token === x.token))
        setTradingList((val) => ({ ...val, list: filter, loaded: false }))
      }
    } catch (e) {
      setTradingList((val) => ({ ...val, list: [], loaded: false }))
    }
  }

  useEffect(() => {
    void func(marginToken)
  }, [marginToken])

  return {
    tradingList
  }
}
