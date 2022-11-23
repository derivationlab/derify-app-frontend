import BN from 'bignumber.js'
import { times, isEmpty } from 'lodash'
import type { BigNumberish } from '@ethersproject/bignumber'

import pairs, { Pair } from '@/config/pairs'
import { multicall } from '@/utils/multicall'
import { getTraderVariablesData } from '@/store/trader/helper'
import { getDerifyExchangeContract } from '@/utils/contractHelpers'
import { nonBigNumberInterception, safeInterceptionValues, toHexString } from '@/utils/tools'

import DerifyDerivativeAbi from '@/config/abi/DerifyDerivative.json'

const BIG_TEN = new BN(10).pow(8)

export enum PositionSide {
  Long,
  Short,
  '2-Way'
}

export enum OrderTypes {
  Limit,
  StopProfit,
  StopLoss
}

interface PairWithSpotPrice extends Pair {
  spotPrice?: string
}

type R = Record<string, any>

export const getPairName = (address: string): string => {
  const find = pairs.find((pair) => pair.token === address.toLowerCase())
  return find?.name ?? ''
}

export const getPairBaseCoinName = (address: string): string => {
  return getPairName(address).split('-')[0]
}

export const getTokenSpotPrice = async (): Promise<PairWithSpotPrice[]> => {
  const calls = times(pairs.length, (index) => ({ address: pairs[index].contract, name: 'getSpotPrice' }))

  try {
    const response = await multicall(DerifyDerivativeAbi, calls)
    // console.info(String(response))
    if (!isEmpty(response)) {
      return response.map(([price]: [BigNumberish], index: number) => ({
        ...pairs[index],
        spotPrice: safeInterceptionValues(price, 8)
      }))
    }
    return pairs
  } catch (e) {
    console.info('GetTokenSpotPrice Error')
    return pairs
  }
}

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

const combineNecessaryData = async (side: PositionSide, params: R, variables: R): Promise<Record<string, any>> => {
  const contract = getDerifyExchangeContract()
  const { size, spotPrice, leverage, price } = params
  const { marginRate, marginBalance, totalPositionAmount } = variables
  const liquidityPrice = calcLiquidityPrice(side, size, spotPrice, marginBalance, totalPositionAmount)

  const data = await contract.getTraderPositionVariables(side, toHexString(spotPrice), size, leverage, price)

  if (!isEmpty(data)) {
    const { margin, returnRate, unrealizedPnl } = data

    return {
      marginRate,
      liquidityPrice,
      margin: safeInterceptionValues(String(margin)),
      leverage: safeInterceptionValues(String(leverage)),
      returnRate: safeInterceptionValues(String(returnRate), 4),
      unrealizedPnl: safeInterceptionValues(String(unrealizedPnl))
    }
  }
  return {}
}

const calcStopLossOrStopProfitPrice = ({ isUsed, stopPrice }: R): string => {
  if (isUsed) return safeInterceptionValues(stopPrice._hex)
  return '--'
}

export const getMyPositionsData = async (trader: string): Promise<R[]> => {
  const outputMyOrders: R[] = []
  const outputMyPosition: R[] = []
  const calls = times(pairs.length, (index) => ({
    address: pairs[index].contract,
    name: 'getTraderDerivativePositions',
    params: [trader]
  }))

  try {
    const response = await multicall(DerifyDerivativeAbi, calls)
    const spotPrices = await getTokenSpotPrice()
    const variables = await getTraderVariablesData(trader) // 0x8BF5722AF17ce9F25211F4Cb8DFF5639831A2250
    // console.info(String(response))
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
        const spotPrice = spotPrices[i]?.spotPrice ?? 0

        // My Positions - long
        if (long.isUsed) {
          const longPositionView = await combineNecessaryData(
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

          outputMyPosition.push({
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

          outputMyPosition.push({
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
        longOrderOpenPosition.forEach((order: R) => {
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

            outputMyOrders.push({
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
        shortOrderOpenPosition.forEach((order: R) => {
          if (order.isUsed) {
            const size = safeInterceptionValues(String(order.size), 8)
            const div = String(new BN(order.price._hex).times(size).div(BIG_TEN))
            const volume = nonBigNumberInterception(div)

            outputMyOrders.push({
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

          outputMyOrders.push({
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

          outputMyOrders.push({
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

          outputMyOrders.push({
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

          outputMyOrders.push({
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
      // console.info(outputMyPosition)

      return [outputMyPosition, outputMyOrders]
    }
    return []
  } catch (e) {
    // console.info(e)
    return []
  }
}

export const outputDataDeal = (prev: R[], next: R[]) => {
  const output = prev.map((p) => {
    const find = next.find((n) => p.token === n.token)
    if (find) return { ...p, ...find }
    return p
  })
  // console.info(output)
  return output
}
