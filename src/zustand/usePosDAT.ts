import create from 'zustand'
import BN from 'bignumber.js'
import { isEmpty } from 'lodash'

import { PosDATState, Rec } from '@/zustand/types'
import { PositionTriggerTypes, PositionSideTypes } from '@/typings'
import { nonBigNumberInterception, safeInterceptionValues } from '@/utils/tools'

import multicall from '@/utils/multicall'
import DerifyDerivativAbi from '@/config/abi/DerifyDerivative.json'

const BIG_TEN = new BN(10).pow(8)

const calcStopLossOrStopProfitPrice = ({ isUsed, stopPrice }: Rec): string => {
  if (isUsed) return safeInterceptionValues(stopPrice._hex)
  return '--'
}

const getMyPositionsData = async (trader: string, factoryConfig: Rec): Promise<Rec[][]> => {
  const positionOrd: Rec[] = []
  const profitLossOrd: Rec[] = []

  const calls = Object.keys(factoryConfig).map((key) => {
    return {
      name: 'getTraderDerivativePositions',
      params: [trader],
      address: factoryConfig[key],
      quoteToken: key
    }
  })
  // console.info(calls)
  try {
    const response = await multicall(DerifyDerivativAbi, calls)

    if (!isEmpty(response)) {
      for (let i = 0; i < response.length; i++) {
        const [
          {
            long,
            short,
            longOrderOpenPosition,
            shortOrderOpenPosition,
            longOrderStopLossPosition,
            shortOrderStopLossPosition,
            longOrderStopProfitPosition,
            shortOrderStopProfitPosition
          }
        ] = response[i]

        // My Positions - long
        if (long.isUsed) {
          // console.info(`spotPrice:${spotPrice}`)
          // console.info(`size:${String(long.size)}/${safeInterceptionValues(String(long.size), 8)}`)
          // console.info(`price:${String(long.price)}/${safeInterceptionValues(String(long.price), 8)}`)
          // console.info(`leverage:${String(long.leverage)}/${safeInterceptionValues(String(long.leverage), 8)}`)

          const size = safeInterceptionValues(String(long.size), 8)

          positionOrd.push({
            size,
            side: PositionSideTypes.long,
            leverage: safeInterceptionValues(String(long.leverage), 8),
            stopLossPrice: calcStopLossOrStopProfitPrice(longOrderStopLossPosition),
            takeProfitPrice: calcStopLossOrStopProfitPrice(longOrderStopProfitPosition),
            averagePrice: safeInterceptionValues(String(long.price), 8),
            quoteToken: calls[i].quoteToken
          })
        }

        // My Positions - short
        if (short.isUsed) {
          // console.info(`spotPrice:${spotPrice}`)
          // console.info(`size:${String(short.size)}/${safeInterceptionValues(String(short.size), 8)}`)
          // console.info(`price:${String(short.price)}/${safeInterceptionValues(String(short.price), 8)}`)
          // console.info(`leverage:${String(short.leverage)}/${safeInterceptionValues(String(short.leverage), 8)}`)
          const size = safeInterceptionValues(String(short.size), 8)

          positionOrd.push({
            size,
            side: PositionSideTypes.short,
            leverage: safeInterceptionValues(String(short.leverage), 8),
            stopLossPrice: calcStopLossOrStopProfitPrice(shortOrderStopLossPosition),
            takeProfitPrice: calcStopLossOrStopProfitPrice(shortOrderStopProfitPosition),
            averagePrice: safeInterceptionValues(String(short.price), 8),
            quoteToken: calls[i].quoteToken
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
              side: PositionSideTypes.long,
              price: safeInterceptionValues(String(order.price)),
              volume,
              leverage: safeInterceptionValues(String(order.leverage)),
              timestamp: String(order.timestamp),
              orderType: PositionTriggerTypes.Limit,
              quoteToken: calls[i].quoteToken
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
              side: PositionSideTypes.short,
              price: safeInterceptionValues(String(order.price)),
              volume,
              leverage: safeInterceptionValues(String(order.leverage)),
              timestamp: String(order.timestamp),
              orderType: PositionTriggerTypes.Limit,
              quoteToken: calls[i].quoteToken
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
            side: PositionSideTypes.long,
            price: safeInterceptionValues(String(longOrderStopProfitPosition.stopPrice)),
            volume,
            leverage: safeInterceptionValues(String(long.leverage)),
            orderType: PositionTriggerTypes.StopProfit,
            timestamp: String(longOrderStopProfitPosition.timestamp),
            quoteToken: calls[i].quoteToken
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
            side: PositionSideTypes.long,
            price: safeInterceptionValues(String(longOrderStopLossPosition.stopPrice)),
            volume,
            leverage: safeInterceptionValues(String(long.leverage)),
            orderType: PositionTriggerTypes.StopLoss,
            timestamp: String(longOrderStopLossPosition.timestamp),
            quoteToken: calls[i].quoteToken
          })
        }

        // My Order - short stop loss
        if (shortOrderStopLossPosition.isUsed) {
          const size = safeInterceptionValues(String(short.size), 8)
          const div = String(new BN(shortOrderStopLossPosition.stopPrice._hex).times(size).div(BIG_TEN))
          const volume = nonBigNumberInterception(div)

          profitLossOrd.push({
            size,
            side: PositionSideTypes.short,
            price: safeInterceptionValues(String(shortOrderStopLossPosition.stopPrice)),
            volume,
            leverage: safeInterceptionValues(String(short.leverage)),
            orderType: PositionTriggerTypes.StopLoss,
            timestamp: String(shortOrderStopLossPosition.timestamp),
            quoteToken: calls[i].quoteToken
          })
        }

        // My Order - short stop profit
        if (shortOrderStopProfitPosition.isUsed) {
          const size = safeInterceptionValues(String(short.size), 8)
          const div = String(new BN(shortOrderStopProfitPosition.stopPrice._hex).times(size).div(BIG_TEN))
          const volume = nonBigNumberInterception(div)

          profitLossOrd.push({
            size,
            side: PositionSideTypes.short,
            price: safeInterceptionValues(String(shortOrderStopProfitPosition.stopPrice)),
            volume,
            leverage: safeInterceptionValues(String(short.leverage)),
            orderType: PositionTriggerTypes.StopProfit,
            timestamp: String(shortOrderStopProfitPosition.timestamp),
            quoteToken: calls[i].quoteToken
          })
        }
        // console.info([positionOrd, profitLossOrd])
      }

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
  fetch: async (trader: string, factoryConfig: Rec) => {
    const [positionOrd, profitLossOrd] = await getMyPositionsData(trader, factoryConfig)
    // console.info('usePosDATStore-positionOrd:')
    // console.info(positionOrd)
    // console.info('usePosDATStore-profitLossOrd:')
    // console.info(profitLossOrd)
    set({ positionOrd, profitLossOrd, loaded: true })
  }
}))

export { usePosDATStore }
