import create from 'zustand'
import { isEmpty } from 'lodash'

import { PosDATState, Rec } from '@/zustand/types'
import { nonBigNumberInterception, safeInterceptionValues, toHexString } from '@/utils/tools'

import DerifyDerivativeAbi from '@/config/abi/DerifyDerivative.json'

import pairs from '@/config/pairs'
import { getTraderVariablesData } from '@/store/trader/helper'
import BN from 'bignumber.js'
import { getTokenSpotPrice, OrderTypes, PositionSide } from '@/store/contract/helper'
import {
  getDerifyDerivativePairContract,
  getDerifyExchangeContract,
  getDerifyExchangeContract1
} from '@/utils/contractHelpers'
import { InitialTraderVariablesType } from '@/hooks/helper'

const BIG_TEN = new BN(10).pow(8)

const calcLiquidityPrice = (
  side: number,
  size: BN,
  spotPrice: string,
  marginBalance: string,
  totalPositionAmount: string
): string => {
  // @size: todo  liquidity price
  const _size = safeInterceptionValues(String(size), 8)
  const _side = side === PositionSide.Short ? -1 : 1
  const _spotPrice = new BN(spotPrice)
  const _marginBalance = new BN(marginBalance)
  const _totalPositionAmount = new BN(totalPositionAmount)
  const p = _spotPrice.minus(_marginBalance.minus(_totalPositionAmount.times(0.03)).div(_size).times(_side))
  return p.isLessThanOrEqualTo(0) ? '--' : safeInterceptionValues(String(p))
}

const calcStopLossOrStopProfitPrice = ({ isUsed, stopPrice }: Rec): string => {
  if (isUsed) return safeInterceptionValues(stopPrice._hex)
  return '--'
}

const combineNecessaryData = async (address: string, side: PositionSide, params: Rec, variables: Rec): Promise<Record<string, any>> => {
  const c = getDerifyExchangeContract1(address)
  const { size, spotPrice, leverage, price } = params
  const { marginRate, marginBalance, totalPositionAmount } = variables
  const liquidityPrice = calcLiquidityPrice(side, size, spotPrice, marginBalance, totalPositionAmount)

  const data = await c.getTraderPositionVariables(side, toHexString(spotPrice), size, leverage, price)

  if (!isEmpty(data)) {
    const { margin, returnRate, unrealizedPnl } = data

    return {
      margin: safeInterceptionValues(String(margin)),
      leverage: safeInterceptionValues(String(leverage)),
      returnRate: safeInterceptionValues(String(returnRate), 4),
      unrealizedPnl: safeInterceptionValues(String(unrealizedPnl)),
      marginRate,
      liquidityPrice
    }
  }

  return {}
}

const getMyPositionsData = async (trader: string, pairAddress: string, exchange: string, spotPrice: string, variables: InitialTraderVariablesType): Promise<Rec[][]> => {
  const positionOrd: Rec[] = []
  const profitLossOrd: Rec[] = []

  const c = getDerifyDerivativePairContract(pairAddress)

  try {
    const response = await c.getTraderDerivativePositions(trader)

    if (!isEmpty(response)) {
      for (let i = 0; i < response.length; i++) {
        const [
          {
            long,
            short,
            longOrderOpenPosition,
            shortOrderOpenPosition,
            longOrderStopLossPosition,
            longOrderStopProfitPosition,
            shortOrderStopLossPosition,
            shortOrderStopProfitPosition
          }
        ] = response[i]

        // My Positions - long
        if (long.isUsed) {
          const longPositionView = await combineNecessaryData(
            exchange,
            PositionSide.Long,
            {
              ...long,
              spotPrice
            },
            variables
          )
          // console.info(`spotPrice:${spotPrice}`)
          // console.info(`size:${String(long.size)}/${safeInterceptionValues(String(long.size), 8)}`)
          // console.info(`price:${String(long.price)}/${safeInterceptionValues(String(long.price), 8)}`)
          // console.info(`leverage:${String(long.leverage)}/${safeInterceptionValues(String(long.leverage), 8)}`)

          const size = safeInterceptionValues(String(long.size), 8)
          const volume = nonBigNumberInterception(String(new BN(spotPrice).times(size)), 8)

          positionOrd.push({
            size,
            volume,
            ...pairs[i],
            ...longPositionView,
            side: PositionSide.Long,
            stopLossPrice: calcStopLossOrStopProfitPrice(longOrderStopLossPosition),
            takeProfitPrice: calcStopLossOrStopProfitPrice(longOrderStopProfitPosition),
            averagePrice: safeInterceptionValues(String(long.price), 8)
          })
        }
        // My Positions - short
        if (short.isUsed) {
          const shortPositionView = await combineNecessaryData(
            exchange,
            PositionSide.Short,
            {
              ...short,
              spotPrice
            },
            variables
          )
          // console.info(`spotPrice:${spotPrice}`)
          // console.info(`size:${String(short.size)}/${safeInterceptionValues(String(short.size), 8)}`)
          // console.info(`price:${String(short.price)}/${safeInterceptionValues(String(short.price), 8)}`)
          // console.info(`leverage:${String(short.leverage)}/${safeInterceptionValues(String(short.leverage), 8)}`)
          const size = safeInterceptionValues(String(short.size), 8)
          const volume = nonBigNumberInterception(String(new BN(spotPrice).times(size)), 8)

          positionOrd.push({
            size,
            volume,
            ...pairs[i],
            ...shortPositionView,
            side: PositionSide.Short,
            stopLossPrice: calcStopLossOrStopProfitPrice(shortOrderStopLossPosition),
            takeProfitPrice: calcStopLossOrStopProfitPrice(shortOrderStopProfitPosition),
            averagePrice: safeInterceptionValues(String(short.price), 8)
          })
        }

        // My Order - long
        longOrderOpenPosition.forEach((order: Rec) => {
          if (order.isUsed) {
            /**
             * isUsed: true
             leverage: BigNumber {_hex: '0x3b9aca00', _isBigNumber: true}
             price: BigNumber {_hex: '0x05f5e100', _isBigNumber: true}
             size: BigNumber {_hex: '0x06bed6', _isBigNumber: true}
             timestamp: BigNumb
             */
              // console.info(`isUsed:${order.isUsed}`)
              // console.info(`size:${String(order.size)}`)
              // console.info(`price:${String(order.price)}`)
              // console.info(`leverage:${String(order.leverage)}`)
            const size = safeInterceptionValues(String(order.size), 8)
            const div = String(new BN(order.price._hex).times(size).div(BIG_TEN))
            const volume = nonBigNumberInterception(div)

            profitLossOrd.push({
              size,
              volume,
              ...pairs[i],
              side: PositionSide.Long,
              price: safeInterceptionValues(String(order.price)),
              leverage: safeInterceptionValues(String(order.leverage)),
              timestamp: String(order.timestamp),
              orderType: OrderTypes.Limit
            })
          }
        })
        // My Order - short
        shortOrderOpenPosition.forEach((order: Rec) => {
          if (order.isUsed) {
            const size = safeInterceptionValues(String(order.size), 8)
            const div = String(new BN(order.price._hex).times(size).div(BIG_TEN))
            const volume = nonBigNumberInterception(div)

            profitLossOrd.push({
              size,
              volume,
              ...pairs[i],
              side: PositionSide.Short,
              price: safeInterceptionValues(String(order.price)),
              leverage: safeInterceptionValues(String(order.leverage)),
              timestamp: String(order.timestamp),
              orderType: OrderTypes.Limit
            })
          }
        })
        // My Order - long stop profit
        if (longOrderStopProfitPosition.isUsed) {
          const size = safeInterceptionValues(String(long.size), 8)
          const div = String(new BN(longOrderStopProfitPosition.stopPrice._hex).times(size).div(BIG_TEN))
          const volume = nonBigNumberInterception(div)

          profitLossOrd.push({
            size,
            volume,
            ...pairs[i],
            side: PositionSide.Long,
            price: safeInterceptionValues(String(longOrderStopProfitPosition.stopPrice)),
            leverage: safeInterceptionValues(String(long.leverage)),
            orderType: OrderTypes.StopProfit,
            timestamp: String(longOrderStopProfitPosition.timestamp)
          })
        }
        // My Order - long stop loss
        if (longOrderStopLossPosition.isUsed) {
          // console.info(`size:${String(long.size)}`)
          // console.info(`price:${String(longOrderStopLossPosition.stopPrice)}`)

          const size = safeInterceptionValues(String(long.size), 8)
          const div = String(new BN(longOrderStopLossPosition.stopPrice._hex).times(size).div(BIG_TEN))
          const volume = nonBigNumberInterception(div)

          profitLossOrd.push({
            size,
            volume,
            ...pairs[i],
            side: PositionSide.Long,
            price: safeInterceptionValues(String(longOrderStopLossPosition.stopPrice)),
            leverage: safeInterceptionValues(String(long.leverage)),
            orderType: OrderTypes.StopLoss,
            timestamp: String(longOrderStopLossPosition.timestamp)
          })
        }
        // My Order - short stop loss
        if (shortOrderStopLossPosition.isUsed) {
          const size = safeInterceptionValues(String(short.size), 8)
          const div = String(new BN(shortOrderStopLossPosition.stopPrice._hex).times(size).div(BIG_TEN))
          const volume = nonBigNumberInterception(div)

          profitLossOrd.push({
            size,
            volume,
            ...pairs[i],
            side: PositionSide.Short,
            price: safeInterceptionValues(String(shortOrderStopLossPosition.stopPrice)),
            leverage: safeInterceptionValues(String(short.leverage)),
            orderType: OrderTypes.StopLoss,
            timestamp: String(shortOrderStopLossPosition.timestamp)
          })
        }
        // My Order - short stop profit
        if (shortOrderStopProfitPosition.isUsed) {
          const size = safeInterceptionValues(String(short.size), 8)
          const div = String(new BN(shortOrderStopProfitPosition.stopPrice._hex).times(size).div(BIG_TEN))
          const volume = nonBigNumberInterception(div)

          profitLossOrd.push({
            size,
            volume,
            ...pairs[i],
            side: PositionSide.Short,
            price: safeInterceptionValues(String(shortOrderStopProfitPosition.stopPrice)),
            leverage: safeInterceptionValues(String(short.leverage)),
            orderType: OrderTypes.StopProfit,
            timestamp: String(shortOrderStopProfitPosition.timestamp)
          })
        }
      }
      // console.info(positionOrd)

      return [positionOrd, profitLossOrd]
    }
    return []
  } catch (e) {
    // console.info(e)
    return []
  }
}

const usePosDATStore = create<PosDATState>((set) => ({
  positionOrd: [],
  profitLossOrd: [],
  loaded: false,
  fetch: async (trader: string, pairAddress: string, exchange: string, spotPrice: string, variables: InitialTraderVariablesType) => {
    const [positionOrd, profitLossOrd] = await getMyPositionsData(trader, pairAddress, exchange, spotPrice, variables)
    console.info('usePosDATStore-positionOrd:')
    console.info(positionOrd)
    console.info('usePosDATStore-profitLossOrd:')
    console.info(profitLossOrd)
    set({ positionOrd, profitLossOrd, loaded: true })
  }
}))

export { usePosDATStore }
