import BN from 'bignumber.js'
import { isEmpty } from 'lodash'

import DerifyProtocolAbi from '@/config/abi/DerifyProtocol.json'
import DerifyRewardsAbi from '@/config/abi/DerifyRewards.json'
import contracts from '@/config/contracts'
import { PositionOrderTypes, PositionSideTypes } from '@/typings'
import {
  getDerifyRewardsContract,
  getDerifyProtocolContract,
  getDerifyExchangeContract,
  getDerifyDerivativeContract
} from '@/utils/contractHelpers'
import multicall from '@/utils/multicall'
import {
  isGT,
  isLT,
  bnDiv,
  formatUnits,
  safeInterceptionValues,
  inputParameterConversion,
  nonBigNumberInterception
} from '@/utils/tools'

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
  return isLT(Number(openingAmount) * Number(mPrice), openingMinLimit)
}

export const calcTradingFee = async (
  pairAddress: string,
  tokenSelect: string,
  openingAmount: string | number,
  spotPrice: string
): Promise<number> => {
  const c = getDerifyDerivativeContract(pairAddress)

  const response = await c.tradingFeeRatio()

  const ratio = Number(safeInterceptionValues(String(response), 8))

  return ratio * Number(openingAmount)
}

export const checkOpeningVol = (
  spotPrice: string,
  openingSize: string,
  positionSide: PositionSideTypes,
  openingType: PositionOrderTypes,
  tokenSelect: string,
  openingMaxLimit: string
) => {
  if (positionSide === PositionSideTypes.twoWay || openingType !== PositionOrderTypes.Market) return openingSize
  const mul = Number(spotPrice) * Number(openingMaxLimit)
  return isGT(openingSize, mul) ? mul : openingSize
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

export const getTraderRewardDAT = async (trader: string, reward: string): Promise<Record<string, any>> => {
  let output = {}
  const calls = [
    {
      name: 'getPositionReward',
      address: reward,
      params: [trader]
    },
    {
      name: 'getBondInfo',
      address: reward,
      params: [trader]
    },
    {
      name: 'getExchangeBondSizeUpperBound',
      address: reward,
      params: [trader]
    },
    {
      name: 'bankBondPool',
      address: reward
    }
  ]

  const response = await multicall(DerifyRewardsAbi, calls)

  if (!isEmpty(response)) {
    const [getPositionReward, getBondInfo, getExchangeBondSizeUpperBound, bankBondPool] = response

    const [bankBalance] = bankBondPool
    const { maxBondSize } = getExchangeBondSizeUpperBound
    const { bondAnnualInterestRatio, bondBalance, bondReturnBalance, bondWalletBalance } = getBondInfo
    const { drfAccumulatedBalance, drfBalance, marginTokenAccumulatedBalance, marginTokenBalance } = getPositionReward

    output = {
      drfBalance: formatUnits(String(drfBalance), 8),
      bankBalance: formatUnits(String(bankBalance), 8),
      bondBalance: formatUnits(String(bondBalance), 8),
      exchangeable: formatUnits(String(maxBondSize), 8),
      bondReturnBalance: formatUnits(String(bondReturnBalance), 8),
      bondWalletBalance: formatUnits(String(bondWalletBalance), 8),
      marginTokenBalance: formatUnits(String(marginTokenBalance), 8),
      drfAccumulatedBalance: formatUnits(String(drfAccumulatedBalance), 8),
      bondAnnualInterestRatio: formatUnits(String(bondAnnualInterestRatio), 8),
      marginTokenAccumulatedBalance: formatUnits(String(marginTokenAccumulatedBalance), 8)
    }

    // console.info(output)
    return output
  }

  return output
}

export const getBankBDRFPoolDAT = async (reward: string) => {
  const c = getDerifyRewardsContract(reward)
  const d = await c.bankBondPool()
  return safeInterceptionValues(String(d), 8)
}

export const getTraderStakingDAT = async (trader: string): Promise<Record<string, any>> => {
  let output = {}
  const calls = [
    {
      name: 'getStakingInfo',
      address: contracts.derifyProtocol.contractAddress,
      params: [trader]
    }
  ]

  const response = await multicall(DerifyProtocolAbi, calls)

  if (!isEmpty(response)) {
    const [{ drfBalance, edrfBalance }] = response
    // console.info('edrfBalance:', safeInterceptionValues(edrfBalance, 8))
    output = {
      drfBalance: safeInterceptionValues(drfBalance, 8),
      edrfBalance: safeInterceptionValues(edrfBalance, 8)
    }

    // console.info(output)
    return output
  }

  return output
}

export const getStakingDrfPoolDAT = async () => {
  const c = getDerifyProtocolContract()
  const d = await c.stakingDrfPool()
  // const d1 = await c.getAllBrokers()
  // console.info(d1)
  return safeInterceptionValues(String(d), 8)
}
