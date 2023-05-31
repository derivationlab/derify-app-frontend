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
  bnMul
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
  exchange: string,
  derivative: string,
  isOpen = false
): Promise<string> => {
  let nakedPositionTradingPairAfterClosing_BN: BN = new BN(0)

  if (side === PositionSideTypes.twoWay) return '0'

  const size = inputParameterConversion(bnDiv(amount, spotPrice), 8)
  const exchangeContract = getDerifyExchangeContract(exchange)
  const derivativeContract = getDerifyDerivativeContract(derivative)

  const liquidityPool = await exchangeContract.liquidityPool()
  const longTotalSize = await derivativeContract.longTotalSize()
  const shortTotalSize = await derivativeContract.shortTotalSize()
  const kRatio = await derivativeContract.kRatio()
  const gRatio = await derivativeContract.gRatio()
  const roRatio = await derivativeContract.roRatio()
  const beforeRatio = await derivativeContract.getPositionChangeFeeRatio()

  const longTotalSize_BN = new BN(longTotalSize._hex)
  const shortTotalSize_BN = new BN(shortTotalSize._hex)

  const nakedPositionTradingPairBeforeClosing_BN = longTotalSize_BN.minus(shortTotalSize_BN)

  if (side === PositionSideTypes.long) {
    if (!isOpen) nakedPositionTradingPairAfterClosing_BN = longTotalSize_BN.minus(size).minus(shortTotalSize_BN)
    else nakedPositionTradingPairAfterClosing_BN = longTotalSize_BN.plus(size).minus(shortTotalSize_BN)
  }

  if (side === PositionSideTypes.short) {
    if (!isOpen) nakedPositionTradingPairAfterClosing_BN = longTotalSize_BN.minus(shortTotalSize_BN.minus(size))
    else {
      nakedPositionTradingPairAfterClosing_BN = longTotalSize_BN.minus(shortTotalSize_BN.plus(size))
    }
  }

  const raw_data_naked_after = safeInterceptionValues(
    String(new BN(safeInterceptionValues(String(nakedPositionTradingPairAfterClosing_BN), 8)).times(spotPrice)),
    8
  )
  const raw_data_naked_before = safeInterceptionValues(
    String(new BN(safeInterceptionValues(String(nakedPositionTradingPairBeforeClosing_BN), 8)).times(spotPrice)),
    8
  )
  const nakedPositionDiff_BN = new BN(raw_data_naked_after).abs().minus(new BN(raw_data_naked_before).abs())

  const raw_data_kRatio = safeInterceptionValues(String(kRatio), 8)
  const minimum = BN.minimum(new BN(liquidityPool._hex).times(raw_data_kRatio), new BN(gRatio._hex))

  const row_data_minimum = safeInterceptionValues(String(minimum), 8)
  const tradingFeeAfterClosing_BN = minimum.isEqualTo(0)
    ? new BN(0)
    : new BN(raw_data_naked_after).div(row_data_minimum)

  const row_data_beforeRatio = safeInterceptionValues(beforeRatio._hex, 8)
  const radioSum = new BN(row_data_beforeRatio).abs().plus(tradingFeeAfterClosing_BN.abs())

  const row_data_roRatio = safeInterceptionValues(roRatio._hex, 8)
  const row_data_naked_final = safeInterceptionValues(String(nakedPositionDiff_BN), 8)
  const fee = new BN(row_data_naked_final).times(radioSum.div(2).plus(row_data_roRatio)).times(-1)

  return nonBigNumberInterception(fee.toFixed(10), 8)
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
