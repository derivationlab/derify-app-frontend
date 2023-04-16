import { create } from 'zustand'
import { isEmpty } from 'lodash'
import { BigNumber } from 'ethers'

import multicall from '@/utils/multicall'
import { PosDATState, Rec } from '@/store/types'
import { bnMul, formatUnits } from '@/utils/tools'
import { PositionTriggerTypes, PositionSideTypes } from '@/typings'

import DerifyDerivativAbi from '@/config/abi/DerifyDerivative.json'

const priceFormat = ({ isUsed, stopPrice }: { isUsed: boolean; stopPrice: BigNumber }): string =>
  isUsed ? formatUnits(stopPrice, 8) : '--'

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
        const size = formatUnits(long.size, 8)

        positionOrd.push({
          size,
          side: PositionSideTypes.long,
          leverage: formatUnits(long.leverage, 8),
          quoteToken: calls[i].quoteToken,
          averagePrice: formatUnits(long.price, 8),
          stopLossPrice: priceFormat(longOrderStopLossPosition),
          takeProfitPrice: priceFormat(longOrderStopProfitPosition)
        })
      }

      // My Positions - short
      if (short.isUsed) {
        const size = formatUnits(short.size, 8)

        positionOrd.push({
          size,
          side: PositionSideTypes.short,
          leverage: formatUnits(short.leverage, 8),
          quoteToken: calls[i].quoteToken,
          averagePrice: formatUnits(short.price, 8),
          stopLossPrice: priceFormat(shortOrderStopLossPosition),
          takeProfitPrice: priceFormat(shortOrderStopProfitPosition)
        })
      }

      // My Order - long
      longOrderOpenPosition.forEach((order: Rec) => {
        if (order.isUsed) {
          const size = formatUnits(order.size, 8)
          const price = formatUnits(order.price, 8)
          const volume = bnMul(price, size)

          profitLossOrd.push({
            size,
            side: PositionSideTypes.long,
            price,
            volume,
            leverage: formatUnits(order.leverage),
            timestamp: String(order.timestamp),
            orderType: PositionTriggerTypes.Limit,
            quoteToken: calls[i].quoteToken
          })
        }
      })

      // My Order - short
      shortOrderOpenPosition.forEach((order: Rec) => {
        if (order.isUsed) {
          const size = formatUnits(order.size, 8)
          const price = formatUnits(order.price, 8)
          const volume = bnMul(price, size)

          profitLossOrd.push({
            size,
            side: PositionSideTypes.short,
            price,
            volume,
            leverage: formatUnits(order.leverage),
            timestamp: String(order.timestamp),
            orderType: PositionTriggerTypes.Limit,
            quoteToken: calls[i].quoteToken
          })
        }
      })

      // My Order - long stop profit
      if (longOrderStopProfitPosition.isUsed) {
        const size = formatUnits(long.size, 8)
        const price = formatUnits(longOrderStopProfitPosition.stopPrice, 8)
        const volume = bnMul(price, size)

        profitLossOrd.push({
          size,
          side: PositionSideTypes.long,
          price,
          volume,
          leverage: formatUnits(long.leverage),
          orderType: PositionTriggerTypes.StopProfit,
          timestamp: String(longOrderStopProfitPosition.timestamp),
          quoteToken: calls[i].quoteToken
        })
      }

      // My Order - long stop loss
      if (longOrderStopLossPosition.isUsed) {
        const size = formatUnits(long.size, 8)
        const price = formatUnits(longOrderStopLossPosition.stopPrice, 8)
        const volume = bnMul(price, size)

        profitLossOrd.push({
          size,
          side: PositionSideTypes.long,
          price,
          volume,
          leverage: formatUnits(long.leverage),
          orderType: PositionTriggerTypes.StopLoss,
          timestamp: String(longOrderStopLossPosition.timestamp),
          quoteToken: calls[i].quoteToken
        })
      }

      // My Order - short stop loss
      if (shortOrderStopLossPosition.isUsed) {
        const size = formatUnits(short.size, 8)
        const price = formatUnits(shortOrderStopLossPosition.stopPrice, 8)
        const volume = bnMul(price, size)

        profitLossOrd.push({
          size,
          side: PositionSideTypes.short,
          price,
          volume,
          leverage: formatUnits(short.leverage),
          orderType: PositionTriggerTypes.StopLoss,
          timestamp: String(shortOrderStopLossPosition.timestamp),
          quoteToken: calls[i].quoteToken
        })
      }

      // My Order - short stop profit
      if (shortOrderStopProfitPosition.isUsed) {
        const size = formatUnits(short.size, 8)
        const price = formatUnits(shortOrderStopProfitPosition.stopPrice, 8)
        const volume = bnMul(price, size)

        profitLossOrd.push({
          size,
          side: PositionSideTypes.short,
          price,
          volume,
          leverage: formatUnits(short.leverage),
          orderType: PositionTriggerTypes.StopProfit,
          timestamp: String(shortOrderStopProfitPosition.timestamp),
          quoteToken: calls[i].quoteToken
        })
      }
    }

    return [positionOrd, profitLossOrd]
  }

  return []
}

const usePosDATStore = create<PosDATState>((set) => ({
  positionOrd: [],
  profitLossOrd: [],
  loaded: false,
  fetch: async (trader: string, factoryConfig: Rec) => {
    const [positionOrd, profitLossOrd] = await getMyPositionsData(trader, factoryConfig)
    set({ positionOrd, profitLossOrd, loaded: true })
  }
}))

export { usePosDATStore }
