import BN from 'bignumber.js'
import { isEmpty } from 'lodash'
import type { Signer } from 'ethers'

import pairs from '@/config/pairs'
import { BASE_TOKEN_SYMBOL, findMarginToken } from '@/config/tokens'
import { OrderTypes, PositionSide } from '@/store/contract/helper'
import { estimateGas } from '@/utils/practicalMethod'
import {
  getDerifyExchangeContract,
  getDerifyExchangeContract1,
  getDerifyDerivativePairContract
} from '@/utils/contractHelpers'
import { nonBigNumberInterception, safeInterceptionValues, toFloorNum, toHexString } from '@/utils/tools'
import { OpeningType } from '@/zustand/useCalcOpeningDAT'

class Trader {
  calcClosePositionTradingFee = async (symbol: string, token: string, amount: number, spotPrice: string) => {
    const pair = pairs.find((pair) => pair.token === token)
    const contract = getDerifyDerivativePairContract(pair!.contract)

    const amount_BN = new BN(amount)
    const volume = symbol === BASE_TOKEN_SYMBOL ? amount_BN : amount_BN.times(spotPrice)

    const ratio = await contract.tradingFeeRatio()

    const _ratio = safeInterceptionValues(String(ratio), 8)

    const fee = String(volume.times(_ratio).toFixed(10))

    return nonBigNumberInterception(fee, 8)
  }

  calcClosePositionChangeFee = async (
    side: PositionSide,
    symbol: string,
    token: string,
    amount: number,
    spotPrice: string,
    exchange: string,
    derivative: string,
    isOpenPosition = false
  ): Promise<string> => {
    let nakedPositionTradingPairAfterClosing_BN: BN = new BN(0)

    if (side === PositionSide.twoWay) return '0'

    const size =
      symbol === BASE_TOKEN_SYMBOL ? toFloorNum(new BN(amount).div(spotPrice).toString()) : toFloorNum(amount)
    const exchangeContract = getDerifyExchangeContract1(exchange)
    const derivativeContract = getDerifyDerivativePairContract(derivative)

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

    if (side === PositionSide.long) {
      if (!isOpenPosition)
        nakedPositionTradingPairAfterClosing_BN = longTotalSize_BN.minus(size).minus(shortTotalSize_BN)
      else nakedPositionTradingPairAfterClosing_BN = longTotalSize_BN.plus(size).minus(shortTotalSize_BN)
    }

    if (side === PositionSide.short) {
      if (!isOpenPosition)
        nakedPositionTradingPairAfterClosing_BN = longTotalSize_BN.minus(shortTotalSize_BN.minus(size))
      else {
        nakedPositionTradingPairAfterClosing_BN = longTotalSize_BN.minus(shortTotalSize_BN.plus(size))
      }
    }

    // console.info(
    //   `开仓量(${symbol}):${size}`,
    //   `开仓后裸头寸：${String(nakedPositionTradingPairAfterClosing_BN)}`,
    //   `开仓前裸头寸：${String(nakedPositionTradingPairBeforeClosing_BN)}`
    // )

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

    // console.info(`raw_data_naked_after:${raw_data_naked_after}`)
    // console.info(`raw_data_naked_before:${raw_data_naked_before}`)
    // console.info(`minimum:${safeInterceptionValues(String(minimum), 8)}`)
    // console.info(`kRatio:${safeInterceptionValues(String(kRatio), 8)}`)
    // console.info(`gRatio:${safeInterceptionValues(String(gRatio), 8)}`)
    // console.info(`roRatio:${safeInterceptionValues(String(roRatio), 8)}`)
    // console.info(`liquidityPool:${safeInterceptionValues(String(liquidityPool), 8)}`)
    // console.info(`最终裸头寸nakedPositionDiff:${safeInterceptionValues(String(nakedPositionDiff_BN), 8)}`)
    // console.info(`开仓前动仓费率:${safeInterceptionValues(String(beforeRatio), 18)}`)
    // console.info(`spotPrice:${spotPrice}`)
    // console.info(`开仓后动仓费率:${String(tradingFeeAfterClosing_BN)}`)

    const row_data_beforeRatio = safeInterceptionValues(beforeRatio._hex, 8)
    const radioSum = new BN(row_data_beforeRatio).abs().plus(tradingFeeAfterClosing_BN.abs())

    // console.info(`radioSum:${radioSum.toFixed(8)}`)

    const row_data_roRatio = safeInterceptionValues(roRatio._hex, 8)
    const row_data_naked_final = safeInterceptionValues(String(nakedPositionDiff_BN), 8)
    const fee = new BN(row_data_naked_final).times(radioSum.div(2).plus(row_data_roRatio)).times(-1)

    return nonBigNumberInterception(fee.toFixed(10), 8)
  }

  openPositionOrder = async (
    signer: Signer,
    brokerId: string,
    token: string,
    side: PositionSide,
    openType: OpeningType,
    quantityType: string,
    quantity: number,
    price: string,
    leverage: number,
    address: string,
    isOrderConversion?: boolean // limit order --> market order
  ): Promise<boolean> => {
    const contract = getDerifyExchangeContract1(address, signer)

    const _price = toFloorNum(price)
    const _leverage = toFloorNum(leverage)
    const _openType = isOrderConversion ? OpeningType.Market : openType
    const _quantityType = quantityType === BASE_TOKEN_SYMBOL ? 1 : 0

    try {
      const checkQuantity = await this.checkOpenPositionSize(
        token,
        side,
        quantityType,
        _openType,
        quantity,
        price,
        address
      )

      const _quantity = toFloorNum(checkQuantity)
      console.info(_quantity)
      const gasLimit = await estimateGas(
        contract,
        'openPosition',
        [brokerId, token, side, _openType, _quantityType, _quantity, _price, _leverage],
        0
      )
      console.info(`
      brokerId：${brokerId},
      token：${token},
      side：${side}/${PositionSide[side]},
      openType：${_openType},
      _quantityType：${_quantityType}/${quantityType},
      _quantity：${quantity}/${_quantity},
      _price：${price}/${_price},
      _leverage：${leverage}/${_leverage}
      `)
      const res = await contract.openPosition(
        brokerId,
        token,
        side,
        _openType,
        _quantityType,
        _quantity,
        _price,
        _leverage,
        {
          gasLimit
        }
      )
      const receipt = await res.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  checkOpenPositionSize = async (
    token: string,
    side: PositionSide,
    type: string,
    openType: OpeningType,
    size: string,
    price: string,
    address: string
  ): Promise<string> => {
    const data = await this.getSysOpenUpperBound(token, side, price, address)
    console.info(data)
    const [systemSizeLimit, systemAmountLimit] = data
    const size_BN = new BN(size)

    if (side === PositionSide.twoWay) return size

    if (openType !== OpeningType.Market) return size

    if (type === BASE_TOKEN_SYMBOL) {
      if (size_BN.isGreaterThan(systemAmountLimit)) {
        return systemAmountLimit
      }
    } else {
      if (size_BN.isGreaterThan(systemSizeLimit)) {
        return systemSizeLimit
      }
    }

    return size
  }

  getSysOpenUpperBound = async (
    token: string,
    side: PositionSide,
    price: string,
    address: string
  ): Promise<string[]> => {
    // todo 不通保证金对应的金额转换

    const c = getDerifyExchangeContract1(address)

    const data = await c.getSysOpenUpperBound(token, side)

    const size = safeInterceptionValues(String(data), 8) // ETH/BTC
    const amount = new BN(size).times(price) // BUSD

    return [size, safeInterceptionValues(String(amount), 8)]
  }

  minimumOpenPositionLimit = (side: PositionSide, price: string, volume: string | number, symbol: string): boolean => {
    const limit = 500
    const calcU = findMarginToken(symbol) ? new BN(volume) : new BN(volume).times(price) // U

    return calcU.isLessThan(limit)
  }

  closeSomePosition = async (
    signer: Signer,
    brokerId: string,
    symbol: string,
    token: string,
    side: string,
    size: string,
    amount: number,
    spotPrice: string,
    whetherStud?: boolean
  ): Promise<boolean> => {
    let SIZE_OUTPUT = ''

    const contract = getDerifyExchangeContract(signer)

    if (whetherStud) {
      SIZE_OUTPUT = toFloorNum(size)
    } else {
      const AMOUNT_BN = new BN(amount)
      const SIZE_BN = symbol === BASE_TOKEN_SYMBOL ? AMOUNT_BN.div(spotPrice) : AMOUNT_BN
      SIZE_OUTPUT = toFloorNum(String(SIZE_BN))
    }

    // console.info(`func: closePosition size`, size, SIZE_OUTPUT)

    try {
      const gasLimit = await estimateGas(contract, 'closePosition', [brokerId, token, side, SIZE_OUTPUT], 0)
      const res = await contract.closePosition(brokerId, token, side, SIZE_OUTPUT, { gasLimit })
      const receipt = await res.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }
}

export default new Trader()
