import { BigNumber } from 'ethers'
import { isEmpty } from 'lodash'

import { useCallback, useEffect, useState } from 'react'

import DerifyDerivativAbi from '@/config/abi/DerifyDerivative.json'
import { Rec } from '@/store/types'
import { PositionSideTypes, PositionTriggerTypes } from '@/typings'
import multicall from '@/utils/multicall'
import { bnMul, formatUnits } from '@/utils/tools'

const priceFormat = ({ isUsed, stopPrice }: { isUsed: boolean; stopPrice: BigNumber }): string =>
  isUsed ? formatUnits(stopPrice, 8) : '--'

const getOwnedPositions = async (trader: string, derAddressList: Rec): Promise<Rec[][]> => {
  const positionOrd: Rec[] = []
  const profitLossOrd: Rec[] = []

  const calls = Object.keys(derAddressList).map((key) => ({
    name: 'getTraderDerivativePositions',
    token: derAddressList[key].token,
    params: [trader],
    address: derAddressList[key].derivative,
    derivative: key
  }))

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
          const size = formatUnits(long.size, 8)

          positionOrd.push({
            size,
            side: PositionSideTypes.long,
            token: calls[i].token,
            leverage: formatUnits(long.leverage, 8),
            contract: calls[i].address,
            derivative: calls[i].derivative,
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
            token: calls[i].token,
            leverage: formatUnits(short.leverage, 8),
            contract: calls[i].address,
            derivative: calls[i].derivative,
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
              token: calls[i].token,
              price,
              volume,
              contract: calls[i].address,
              leverage: formatUnits(order.leverage),
              timestamp: String(order.timestamp),
              orderType: PositionTriggerTypes.Limit,
              derivative: calls[i].derivative
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
              token: calls[i].token,
              price,
              volume,
              contract: calls[i].address,
              leverage: formatUnits(order.leverage),
              timestamp: String(order.timestamp),
              orderType: PositionTriggerTypes.Limit,
              derivative: calls[i].derivative
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
            token: calls[i].token,
            price,
            volume,
            contract: calls[i].address,
            leverage: formatUnits(long.leverage),
            orderType: PositionTriggerTypes.StopProfit,
            timestamp: String(longOrderStopProfitPosition.timestamp),
            derivative: calls[i].derivative
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
            token: calls[i].token,
            price,
            volume,
            contract: calls[i].address,
            leverage: formatUnits(long.leverage),
            orderType: PositionTriggerTypes.StopLoss,
            timestamp: String(longOrderStopLossPosition.timestamp),
            derivative: calls[i].derivative
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
            token: calls[i].token,
            price,
            volume,
            contract: calls[i].address,
            leverage: formatUnits(short.leverage),
            orderType: PositionTriggerTypes.StopLoss,
            timestamp: String(shortOrderStopLossPosition.timestamp),
            derivative: calls[i].derivative
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
            token: calls[i].token,
            price,
            volume,
            contract: calls[i].address,
            leverage: formatUnits(short.leverage),
            orderType: PositionTriggerTypes.StopProfit,
            timestamp: String(shortOrderStopProfitPosition.timestamp),
            derivative: calls[i].derivative
          })
        }
      }

      return [positionOrd, profitLossOrd]
    }
  } catch (e) {
    return []
  }

  return []
}

export const useOwnedPositions = (trader: string | undefined, derAddressList: Rec | null) => {
  const [ownedPositions, setOwnedPositions] = useState<Rec | undefined>(undefined)

  const func = useCallback(
    async (trader: string, derAddressList: Rec) => {
      const [positionOrd, profitLossOrd] = await getOwnedPositions(trader, derAddressList)

      setOwnedPositions({
        positionOrd,
        profitLossOrd
      })
    },
    [trader, derAddressList]
  )

  useEffect(() => {
    if (trader && derAddressList) {
      void func(trader, derAddressList)
    }
  }, [trader, derAddressList])

  return {
    loaded: !ownedPositions,
    ownedPositions,
    getOwnedPositions: func
  }
}
