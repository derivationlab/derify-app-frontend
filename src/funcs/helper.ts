import BN from 'bignumber.js'

import { PositionOrderTypes, PositionSideTypes } from '@/typings'
import { getDerifyExchangeContract, getDerifyDerivativeContract } from '@/utils/contractHelpers'
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

export const calcTradingFee = async (
  pairAddress: string,
  tokenSelect: string,
  openingAmount: string | number
): Promise<number> => {
  const c = getDerifyDerivativeContract(pairAddress)

  const response = await c.tradingFeeRatio()

  const ratio = Number(safeInterceptionValues(String(response), 8))

  return ratio * Number(openingAmount)
}

export const calcChangeFee = async (
  side: PositionSideTypes,
  symbol: string,
  amount: string | number,
  spotPrice: string,
  marginPrice: string,
  exchange: string,
  derivative: string,
  isOpen = false
): Promise<string> => {
  let nakedPositionTradingPairAfterClosing = '0'

  if (side === PositionSideTypes.twoWay) return '0'

  const exchangeContract = getDerifyExchangeContract(exchange)
  const derivativeContract = getDerifyDerivativeContract(derivative)

  const liquidityPool = await exchangeContract.liquidityPool()
  const longTotalSize = await derivativeContract.longTotalSize()
  const shortTotalSize = await derivativeContract.shortTotalSize()
  const kRatio = await derivativeContract.kRatio()
  const gRatio = await derivativeContract.gRatio()
  const roRatio = await derivativeContract.roRatio()
  const beforeRatio = await derivativeContract.getPositionChangeFeeRatio()

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

export const checkOpeningVol = (
  spotPrice: string,
  openingSize: string,
  positionSide: PositionSideTypes,
  openingType: PositionOrderTypes,
  tokenSelect: string,
  openingMaxLimit: string
): any[] => {
  if (openingType === PositionOrderTypes.Limit) return [0, false, openingSize]
  if (positionSide === PositionSideTypes.twoWay) return [0, false, openingSize]
  const maximum = Number(spotPrice) * Number(openingMaxLimit)
  const isGreater = isGT(openingSize, maximum)
  const effective = isGreater ? maximum : openingSize
  return [maximum, isGreater, effective]
}
