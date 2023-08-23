import BN from 'bignumber.js'

import { checkMarginToken as _checkMarginToken } from '@/api'
import { ZERO } from '@/config'
import { marginTokenPersistKey } from '@/store'
import { PositionOrderTypes, PositionSideTypes } from '@/typings'
import { getExchangeContract, getDerivativeContract, getProtocolContract } from '@/utils/contractHelpers'
import {
  isGT,
  isLT,
  bnDiv,
  safeInterceptionValues,
  inputParameterConversion,
  nonBigNumberInterception,
  bnMul,
  formatUnits,
  bnMinus,
  bnPlus,
  bnAbs,
  isET
} from '@/utils/tools'

export const calcTradingFee = async (pairAddress: string, openingAmount: string | number): Promise<number> => {
  const c = getDerivativeContract(pairAddress)

  const response = await c.tradingFeeRatio()

  const ratio = Number(safeInterceptionValues(String(response), 8))

  return ratio * Number(openingAmount)
}

export const calcChangeFee = async (
  side: PositionSideTypes,
  amount: string | number,
  spotPrice: string,
  marginPrice: string,
  exchange: string,
  derivative: string,
  isOpen = false
): Promise<string> => {
  let nakedPositionTradingPairAfterClosing = '0'

  if (side === PositionSideTypes.twoWay) return '0'

  const exchangeContract = getExchangeContract(exchange)
  const derivativeContract = getDerivativeContract(derivative)

  const liquidityPool = await exchangeContract.liquidityPool()
  const longTotalSize = await derivativeContract.longTotalSize()
  const shortTotalSize = await derivativeContract.shortTotalSize()
  const kRatio = await derivativeContract.kRatio()
  const gRatio = await derivativeContract.gRatio()
  const roRatio = await derivativeContract.roRatio()
  const beforeRatio = await derivativeContract.callStatic.getPositionChangeFeeRatio()

  const _size = bnDiv(amount, spotPrice)
  const _liquidityPool = formatUnits(liquidityPool, 8)
  const _longTotalSize = formatUnits(longTotalSize, 8)
  const _shortTotalSize = formatUnits(shortTotalSize, 8)
  const _kRatio = formatUnits(kRatio, 8)

  const _gRatio = formatUnits(gRatio, 8)
  const _roRatio = formatUnits(roRatio, 8)
  const _beforeRatio = formatUnits(beforeRatio, 8)
  const nakedPositionTradingPairBeforeClosing = bnMinus(_longTotalSize, _shortTotalSize)

  if (side === PositionSideTypes.long) {
    if (!isOpen) nakedPositionTradingPairAfterClosing = bnMinus(nakedPositionTradingPairBeforeClosing, _size)
    else nakedPositionTradingPairAfterClosing = bnPlus(nakedPositionTradingPairBeforeClosing, _size)
  }

  if (side === PositionSideTypes.short) {
    if (!isOpen) nakedPositionTradingPairAfterClosing = bnMinus(_longTotalSize, bnMinus(_shortTotalSize, _size))
    else {
      nakedPositionTradingPairAfterClosing = bnMinus(_longTotalSize, bnPlus(_shortTotalSize, _size))
    }
  }

  const raw_data_naked_after = bnMul(nakedPositionTradingPairAfterClosing, spotPrice)
  const raw_data_naked_before = bnMul(nakedPositionTradingPairBeforeClosing, spotPrice)
  const nakedPositionDiff = bnMinus(bnAbs(raw_data_naked_after), bnAbs(raw_data_naked_before))
  const minimum = BN.minimum(bnMul(_liquidityPool, _kRatio), bnDiv(_gRatio, marginPrice)).toString()
  const tradingFeeAfterClosing = isET(minimum, 0) ? '0' : bnDiv(raw_data_naked_after, minimum)
  const radioSum = bnPlus(bnAbs(_beforeRatio), bnAbs(tradingFeeAfterClosing))
  const fee = bnMul(bnMul(nakedPositionDiff, bnPlus(bnDiv(radioSum, 2), _roRatio)), -1)
  return nonBigNumberInterception(fee, 8)
}

export const calcProfitOrLoss = (TP: number, SL: number): Record<string, any> => {
  if (TP > 0) {
    switch (true) {
      case SL > 0:
        return { method: 'orderStopPosition', stopType: 2 }
      case SL < 0:
        return { method: 'orderAndCancelStopPosition', orderStopType: 0, cancelStopType: 1 }
      default:
        return { method: 'orderStopPosition', stopType: 0 }
    }
  } else if (TP < 0) {
    switch (true) {
      case SL > 0:
        return { method: 'orderAndCancelStopPosition', orderStopType: 1, cancelStopType: 0 }
      case SL < 0:
        return { method: 'cancelOrderedStopPosition', stopType: 2 }
      default:
        return { method: 'cancelOrderedStopPosition', stopType: 0 }
    }
  } else {
    switch (true) {
      case SL > 0:
        return { method: 'orderStopPosition', stopType: 1 }
      case SL < 0:
        return { method: 'cancelOrderedStopPosition', stopType: 1 }
      default:
        return {}
    }
  }
}

export const isOpeningMinLimit = (mPrice: string, openingMinLimit: string, openingAmount: string): boolean => {
  return isLT(bnMul(openingAmount, mPrice), openingMinLimit)
}

export const checkClosingLimit = (spotPrice: string, closingSize: string, closingMaxLimit: string): any[] => {
  const maximum = bnMul(spotPrice, closingMaxLimit)
  const isGreater = isGT(closingSize, maximum)
  const effective = isGreater ? maximum : closingSize
  return [maximum, isGreater, effective]
}

export const checkOpeningLimit = (
  spotPrice: string,
  openingSize: string,
  positionSide: PositionSideTypes,
  openingType: PositionOrderTypes,
  openingMaxLimit: string
): any[] => {
  if (openingType === PositionOrderTypes.Limit) return [0, false, openingSize]
  if (positionSide === PositionSideTypes.twoWay) return [0, false, openingSize]
  const maximum = bnMul(spotPrice, openingMaxLimit)
  const isGreater = isGT(openingSize, maximum)
  const effective = isGreater ? maximum : openingSize
  return [maximum, isGreater, effective]
}

export const calcDisposableAmount = async (
  price: string,
  trader: string,
  exchange: string,
  quoteToken: string,
  leverageNow: number,
  openingType: PositionOrderTypes
) => {
  const contract = getExchangeContract(exchange)
  const _price = inputParameterConversion(price, 8)
  const _leverageNow = inputParameterConversion(leverageNow, 8)

  try {
    const data = await contract.getTraderOpenUpperBound(quoteToken, trader, openingType, _price, _leverageNow)
    const { size, amount } = data
    return [formatUnits(String(size), 8), formatUnits(String(amount), 8)]
  } catch (e) {
    // console.info(e)
    return ['0', '0']
  }
}

export const getPosMaxLeverage = async (address: string) => {
  const contract = getDerivativeContract(address)
  const response = await contract.maxLeverage()
  return formatUnits(String(response), 8)
}

export const checkMarginToken = async (marginToken: string) => {
  const { data } = await _checkMarginToken(marginToken)
  if (data) {
    const contract = getProtocolContract()
    const response = await contract.getMarginTokenContractCollections(data.margin_token)
    const [address] = response
    return address !== ZERO ? data : null
  }
  return null
}

export const outputErrorLog = (contractAddress: string, contractName: string, functionName: string) => {
  const marginTokenInfo = localStorage.getItem(marginTokenPersistKey)
  const parseMarginTokenInfo = JSON.parse(marginTokenInfo ?? '')
  console.info(`marginToken = ${parseMarginTokenInfo?.state?.marginToken?.symbol}(${parseMarginTokenInfo?.state?.marginToken?.address})\ncontractName = ${contractName}\nfunctionName = ${functionName}\ncontractAddress = ${contractAddress}
`)
}
