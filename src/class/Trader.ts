import BN from 'bignumber.js'
import { isEmpty } from 'lodash'
import type { Signer } from 'ethers'

import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { PriceType } from '@/pages/web/Trade/Bench'
import { OrderTypes, PositionSide } from '@/store/contract/helper'
import { estimateGas, setAllowance } from '@/utils/practicalMethod'
import {
  getDerifyExchangeContract,
  getDerifyDerivativeBTCContract,
  getDerifyDerivativeETHContract
} from '@/utils/contractHelpers'
import { nonBigNumberInterception, safeInterceptionValues, toFloorNum, toHexString } from '@/utils/tools'
import { getBTCAddress, getBUSDAddress, getDerifyExchangeAddress, getETHAddress } from '@/utils/addressHelpers'

class Trader {
  traderWithdrawMargin = async (signer: Signer, amount: string): Promise<boolean> => {
    const contract = getDerifyExchangeContract(signer)

    try {
      const _amount = toHexString(amount)

      const gasLimit = await estimateGas(contract, 'withdraw', [_amount], 0)
      const res = await contract.withdraw(_amount, { gasLimit })
      const receipt = await res.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  traderDepositMargin = async (signer: Signer, account: string, amount: string): Promise<boolean> => {
    const contract = getDerifyExchangeContract(signer)

    try {
      const _amount = toHexString(amount)
      const approve = await setAllowance(signer, getDerifyExchangeAddress(), getBUSDAddress(), _amount)

      if (!approve) return false

      const gasLimit = await estimateGas(contract, 'deposit', [_amount], 0)
      const res = await contract.deposit(_amount, { gasLimit })
      const receipt = await res.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  calcClosePositionTradingFee = async (symbol: string, token: string, amount: string, spotPrice: string) => {
    const contracts = {
      [getBTCAddress()]: getDerifyDerivativeBTCContract(),
      [getETHAddress()]: getDerifyDerivativeETHContract()
    }
    const _amount = new BN(amount)
    const size = symbol === BASE_TOKEN_SYMBOL ? _amount.div(spotPrice) : _amount

    const ratio = await contracts[token].tradingFeeRatio()

    const _ratio = safeInterceptionValues(String(ratio), 8)
    // console.info(`size:${String(size)}`, `price:${spotPrice}`)
    // console.info(`ratio:${_ratio}`, String(size.times(spotPrice).times(_ratio))) // 0.0005
    const fee = String(size.times(spotPrice).times(_ratio))
    return nonBigNumberInterception(fee)
  }

  calcClosePositionChangeFee = async (
    side: PositionSide,
    symbol: string,
    token: string,
    amount: string,
    spotPrice: string,
    isOpenPosition = false
  ): Promise<string> => {
    if (side === PositionSide['2-Way']) return '0'
    // console.info(side, symbol, amount, spotPrice, isOpenPosition)
    const size =
      symbol === BASE_TOKEN_SYMBOL ? toFloorNum(new BN(amount).div(spotPrice).toString()) : toFloorNum(amount)
    // console.info(`size:${size}`)
    let nakedPositionTradingPairAfterClosing_BN: BN = new BN(0)

    const contracts = {
      [getBTCAddress()]: getDerifyDerivativeBTCContract(),
      [getETHAddress()]: getDerifyDerivativeETHContract()
    }

    const longTotalSize = await contracts[token].longTotalSize()
    const shortTotalSize = await contracts[token].shortTotalSize()

    const longTotalSize_BN = new BN(longTotalSize._hex)
    const shortTotalSize_BN = new BN(shortTotalSize._hex)

    const nakedPositionTradingPairBeforeClosing_BN = longTotalSize_BN.minus(shortTotalSize_BN)

    if (side === PositionSide.Long) {
      if (!isOpenPosition)
        nakedPositionTradingPairAfterClosing_BN = longTotalSize_BN.minus(size).minus(shortTotalSize_BN)
      else nakedPositionTradingPairAfterClosing_BN = longTotalSize_BN.plus(size).minus(shortTotalSize_BN)
    }

    if (side === PositionSide.Short) {
      if (!isOpenPosition)
        nakedPositionTradingPairAfterClosing_BN = longTotalSize_BN.minus(shortTotalSize_BN.minus(size))
      else {
        nakedPositionTradingPairAfterClosing_BN = longTotalSize_BN.minus(shortTotalSize_BN.plus(size))
      }
    }

    const nakedPositionDiff_BN = nakedPositionTradingPairAfterClosing_BN
      .abs()
      .minus(nakedPositionTradingPairBeforeClosing_BN.abs())
    // console.info(`nakedPositionDiff:${String(nakedPositionDiff_BN)}`)

    const tradingFeesBeforeClosing = await contracts[token].getPositionChangeFeeRatio()
    const tradingFeesBeforeClosing_BN = new BN(tradingFeesBeforeClosing._hex)

    const tradingFeesAfterClosing = nakedPositionTradingPairBeforeClosing_BN.isEqualTo(0)
      ? new BN(0)
      : tradingFeesBeforeClosing_BN
        .times(nakedPositionTradingPairAfterClosing_BN)
        .div(nakedPositionTradingPairBeforeClosing_BN) // nakedPositionTradingPairBeforeClosing_BN: maybe 0
        .integerValue(BN.ROUND_FLOOR)
    const radioSum = tradingFeesAfterClosing.abs().plus(tradingFeesBeforeClosing_BN.abs())
    // console.info(`radioSum:${String(radioSum)}`)

    const fee = await contracts[token].getPositionChangeFee(String(nakedPositionDiff_BN), String(radioSum))
    // console.info(String(fee), safeInterceptionValues(fee, 8), 8)

    return safeInterceptionValues(String(fee))
  }

  calcOrderOperateType = (TP: number, SL: number): Record<string, any> => {
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

  takeProfitOrStopLoss = async (
    signer: Signer,
    token: string,
    side: number,
    takeProfitPrice: number,
    stopLossPrice: number
  ): Promise<boolean> => {
    const contracts = {
      [getBTCAddress()]: getDerifyDerivativeBTCContract(signer),
      [getETHAddress()]: getDerifyDerivativeETHContract(signer)
    }
    const contract = contracts[token]

    const job = this.calcOrderOperateType(takeProfitPrice, stopLossPrice)
    console.info(job)
    if (isEmpty(job)) return true

    const { method, stopType, orderStopType, cancelStopType } = job
    const _takeProfitPrice = toFloorNum(takeProfitPrice)
    const _stopLossPrice = toFloorNum(stopLossPrice)

    try {
      const trader = await signer.getAddress()
      /**
       #### orderStopPosition
       */
      // console.info(trader, side, stopType, _takeProfitPrice, _stopLossPrice)
      if (method === 'orderStopPosition') {
        const gasLimit = await estimateGas(
          contract,
          'orderStopPosition',
          [side, stopType, _takeProfitPrice, _stopLossPrice],
          0
        )
        const data = await contract.orderStopPosition(side, stopType, _takeProfitPrice, _stopLossPrice, {
          gasLimit
        })
        const receipt = await data.wait()
        return receipt.status
      }
      /**
       #### cancleOrderedStopPosition
       */
      if (method === 'cancelOrderedStopPosition') {
        const gasLimit = await estimateGas(contract, 'cancelOrderedStopPosition', [stopType, side], 0)
        const data = await contract.cancelOrderedStopPosition(stopType, side, { gasLimit })
        const receipt = await data.wait()
        return receipt.status
      }
      /**
       #### orderAndCancleStopPosition
       */
      if (method === 'orderAndCancelStopPosition') {
        const price = orderStopType === 0 ? _takeProfitPrice : _stopLossPrice

        const gasLimit = await estimateGas(
          contract,
          'orderAndCancelStopPosition',
          [side, orderStopType, price, cancelStopType],
          0
        )
        const data = await contract.orderAndCancelStopPosition(side, orderStopType, price, cancelStopType, {
          gasLimit
        })
        const receipt = await data.wait()
        return receipt.status
      }

      return false
    } catch (e) {
      console.info(e)
      return false
    }
  }

  openPositionOrder = async (
    signer: Signer,
    brokerId: string,
    token: string,
    side: PositionSide,
    openType: PriceType,
    quantityType: string,
    quantity: string,
    price: string,
    leverage: string,
    isOrderConversion?: boolean // limit order --> market order
  ): Promise<boolean> => {
    const contract = getDerifyExchangeContract(signer)

    const _price = toFloorNum(price)
    const _leverage = toFloorNum(leverage)
    const _openType = isOrderConversion ? PriceType.Market : openType
    const _quantityType = quantityType === BASE_TOKEN_SYMBOL ? 1 : 0

    try {
      const checkQuantity = await this.checkOpenPositionSize(token, side, quantityType, _openType, quantity, price)

      const _quantity = toFloorNum(checkQuantity)

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
    openType: PriceType,
    size: string,
    price: string
  ): Promise<string> => {
    const data = await this.getSysOpenUpperBound(token, side, price)

    const [_size, _amount] = data
    const size_BN = new BN(size)

    if (side === PositionSide['2-Way']) return size

    if (openType !== PriceType.Market) return size

    if (type === BASE_TOKEN_SYMBOL) {
      if (size_BN.isGreaterThan(_amount)) {
        return _amount
      }
    } else {
      if (size_BN.isGreaterThan(_size)) {
        return _size
      }
    }

    return size
  }

  getOpenUpperBound = async (
    token: string,
    trader: string,
    openType: number,
    price: string,
    leverage: number
  ): Promise<string[]> => {
    const _price = toHexString(price)
    const _leverage = toHexString(leverage)
    const contract = getDerifyExchangeContract()

    const data = await contract.getTraderOpenUpperBound(token, trader, openType, _price, _leverage)

    const { size, amount } = data

    return [safeInterceptionValues(String(size), 8), safeInterceptionValues(String(amount), 8)]
  }

  getSysOpenUpperBound = async (token: string, side: PositionSide, price: string): Promise<string[]> => {
    const contract = getDerifyExchangeContract()
    const data = await contract.getSysOpenUpperBound(token, side)

    const size = safeInterceptionValues(String(data), 8) // ETH/BTC
    const amount = new BN(size).times(price) // BUSD

    return [size, safeInterceptionValues(String(amount), 8)]
  }

  minimumOpenPositionLimit = (side: string, price: string, volume: string | number, symbol: string): boolean => {
    const limit = 100
    const calcU = symbol === BASE_TOKEN_SYMBOL ? new BN(volume) : new BN(volume).times(price) // U

    return calcU.isLessThan(limit)
  }

  cancelSomePosition = async (
    signer: Signer,
    token: string,
    side: string,
    orderType: OrderTypes,
    timestamp: string
  ): Promise<boolean> => {
    let response: any = null
    const contracts = {
      [getBTCAddress()]: getDerifyDerivativeBTCContract(signer),
      [getETHAddress()]: getDerifyDerivativeETHContract(signer)
    }

    try {
      if (orderType === OrderTypes.Limit) {
        const gasLimit = await estimateGas(contracts[token], 'cancelOrderedLimitPosition', [side, timestamp], 0)
        response = await contracts[token].cancelOrderedLimitPosition(side, timestamp, { gasLimit })
      } else {
        const gasLimit = await estimateGas(contracts[token], 'cancelOrderedStopPosition', [orderType - 1, side], 0)
        response = await contracts[token].cancelOrderedStopPosition(orderType - 1, side, { gasLimit })
      }

      const receipt = await response.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  closeSomePosition = async (
    signer: Signer,
    brokerId: string,
    symbol: string,
    token: string,
    side: string,
    size: string,
    amount: string,
    spotPrice: string,
    whetherStud?: boolean
  ): Promise<boolean> => {
    let SIZE_OUTPUT = ''
    const contract = getDerifyExchangeContract(signer)
    // console.info(whetherStud)
    if (whetherStud) {
      SIZE_OUTPUT = toFloorNum(size)
    } else {
      const AMOUNT_BN = new BN(amount)
      const SIZE_BN = symbol === BASE_TOKEN_SYMBOL ? AMOUNT_BN.div(spotPrice) : AMOUNT_BN
      SIZE_OUTPUT = toFloorNum(String(SIZE_BN))
    }

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

  closeAllPositions = async (signer: Signer, brokerId: string): Promise<boolean> => {
    const contract = getDerifyExchangeContract(signer)

    try {
      const gasLimit = await estimateGas(contract, 'closeAllPositions', [brokerId], 0)
      const res = await contract.closeAllPositions(brokerId, { gasLimit })
      const receipt = await res.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }

  cancelAllPosOrders = async (signer: Signer): Promise<boolean> => {
    const contract = getDerifyExchangeContract(signer)

    try {
      const gasLimit = await estimateGas(contract, 'cancelAllOrderedPositions', [], 0)
      const res = await contract.cancelAllOrderedPositions({ gasLimit })
      const receipt = await res.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }
}

export default new Trader()
