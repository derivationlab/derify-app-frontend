import { getDerivativeList } from 'derify-apis'
import { BigNumber } from 'ethers'
import { isEmpty, debounce } from 'lodash-es'

import { useCallback, useEffect, useState } from 'react'

import { ZERO } from '@/config'
import DerifyDerivativAbi from '@/config/abi/DerifyDerivative.json'
import { getPairAddressList } from '@/funcs/helper'
import { PositionSideTypes, PositionTriggerTypes, Rec } from '@/typings'
import multicall, { Call } from '@/utils/multicall'
import { formatUnits } from '@/utils/tools'

const priceFormat = ({ isUsed, stopPrice }: { isUsed: boolean; stopPrice: BigNumber }): string =>
  isUsed ? String(stopPrice) : '--'

const getOwnedPositions = async (trader: string, list: Rec[]): Promise<Rec[][]> => {
  const calls: Rec[] = []
  const positionOrd: Rec[] = []
  const profitLossOrd: Rec[] = []

  try {
    list.forEach((l) => {
      calls.push({
        name: 'getTraderDerivativePositions',
        token: l.token,
        params: [trader],
        address: l.derivative,
        decimals: l.price_decimals,
        quoteToken: l.name.split('/')[0],
        derivative: l.name
      })
    })
    const response = await multicall(DerifyDerivativAbi, calls as Call[])

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
            name: calls[i].derivative,
            token: calls[i].token,
            decimals: calls[i].decimals,
            leverage: formatUnits(long.leverage, 8),
            pairAddress: calls[i].address,
            quoteToken: calls[i].quoteToken,
            averagePrice: String(long.price),
            stopLossPrice: priceFormat(longOrderStopLossPosition),
            takeProfitPrice: priceFormat(longOrderStopProfitPosition)
          })
        }

        // My Positions - short
        if (short.isUsed) {
          const size = formatUnits(short.size, 8)
          positionOrd.push({
            size,
            name: calls[i].derivative,
            side: PositionSideTypes.short,
            token: calls[i].token,
            decimals: calls[i].decimals,
            leverage: formatUnits(short.leverage, 8),
            pairAddress: calls[i].address,
            quoteToken: calls[i].quoteToken,
            averagePrice: String(short.price),
            stopLossPrice: priceFormat(shortOrderStopLossPosition),
            takeProfitPrice: priceFormat(shortOrderStopProfitPosition)
          })
        }

        // My Order - long
        longOrderOpenPosition.forEach((order: Rec) => {
          if (order.isUsed) {
            profitLossOrd.push({
              size: formatUnits(order.size, 8),
              name: calls[i].derivative,
              side: PositionSideTypes.long,
              token: calls[i].token,
              price: String(order.price),
              decimals: calls[i].decimals,
              pairAddress: calls[i].address,
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
            profitLossOrd.push({
              size: formatUnits(order.size, 8),
              name: calls[i].derivative,
              side: PositionSideTypes.short,
              token: calls[i].token,
              price: String(order.price),
              decimals: calls[i].decimals,
              pairAddress: calls[i].address,
              leverage: formatUnits(order.leverage),
              timestamp: String(order.timestamp),
              orderType: PositionTriggerTypes.Limit,
              quoteToken: calls[i].quoteToken
            })
          }
        })

        // My Order - long stop profit
        if (longOrderStopProfitPosition.isUsed) {
          profitLossOrd.push({
            size: formatUnits(long.size, 8),
            name: calls[i].derivative,
            side: PositionSideTypes.long,
            token: calls[i].token,
            price: String(longOrderStopProfitPosition.stopPrice),
            decimals: calls[i].decimals,
            pairAddress: calls[i].address,
            leverage: formatUnits(long.leverage),
            orderType: PositionTriggerTypes.StopProfit,
            timestamp: String(longOrderStopProfitPosition.timestamp),
            quoteToken: calls[i].quoteToken
          })
        }

        // My Order - long stop loss
        if (longOrderStopLossPosition.isUsed) {
          profitLossOrd.push({
            size: formatUnits(long.size, 8),
            name: calls[i].derivative,
            side: PositionSideTypes.long,
            token: calls[i].token,
            price: String(longOrderStopLossPosition.stopPrice),
            decimals: calls[i].decimals,
            pairAddress: calls[i].address,
            leverage: formatUnits(long.leverage),
            orderType: PositionTriggerTypes.StopLoss,
            timestamp: String(longOrderStopLossPosition.timestamp),
            quoteToken: calls[i].quoteToken
          })
        }

        // My Order - short stop loss
        if (shortOrderStopLossPosition.isUsed) {
          profitLossOrd.push({
            size: formatUnits(short.size, 8),
            name: calls[i].derivative,
            side: PositionSideTypes.short,
            token: calls[i].token,
            price: String(shortOrderStopLossPosition.stopPrice),
            decimals: calls[i].decimals,
            pairAddress: calls[i].address,
            leverage: formatUnits(short.leverage),
            orderType: PositionTriggerTypes.StopLoss,
            timestamp: String(shortOrderStopLossPosition.timestamp),
            quoteToken: calls[i].quoteToken
          })
        }

        // My Order - short stop profit
        if (shortOrderStopProfitPosition.isUsed) {
          profitLossOrd.push({
            size: formatUnits(short.size, 8),
            name: calls[i].derivative,
            side: PositionSideTypes.short,
            token: calls[i].token,
            price: String(shortOrderStopProfitPosition.stopPrice),
            decimals: calls[i].decimals,
            pairAddress: calls[i].address,
            leverage: formatUnits(short.leverage),
            orderType: PositionTriggerTypes.StopProfit,
            timestamp: String(shortOrderStopProfitPosition.timestamp),
            quoteToken: calls[i].quoteToken
          })
        }
      }
    }

    return [positionOrd, profitLossOrd]
  } catch (e) {
    return []
  }
}

export const useOwnedPositions = (trader: string | undefined, derAddressList: any) => {
  const [positionLoaded, setPositionLoaded] = useState<boolean>(true)
  const [ownedPositions, setOwnedPositions] = useState<Rec | undefined>(undefined)

  const func = useCallback(
    debounce(async (trader: string, derAddressList: any) => {
      const [positionOrd, profitLossOrd] = await getOwnedPositions(trader, derAddressList)

      setOwnedPositions({
        positionOrd,
        profitLossOrd
      })
      setPositionLoaded(false)
    }, 1000),
    []
  )

  useEffect(() => {
    if (trader) {
      void func(trader, derAddressList)
    }
  }, [trader, derAddressList])

  return {
    loaded: positionLoaded,
    ownedPositions,
    getOwnedPositions: func
  }
}

export const useOwnedPositionsBackUp = (trader?: string, factory?: string, marginToken?: string) => {
  const [positionLoaded, setPositionLoaded] = useState<boolean>(true)
  const [ownedPositions, setOwnedPositions] = useState<Rec | undefined>(undefined)

  const func = useCallback(
    debounce(async (trader: string, factory: string, marginToken: string) => {
      /**
       * FIXME:?
       * Orders need to display all trading pairs,
       * which conflicts with the trading pair paging function.
       * Currently, more trading pair data is pulled to make up for it.
       *
       * If the transaction pair data exceeds 200,
       * or the centralized interface limits the number, it will be troublesome
       */
      const { data } = await getDerivativeList<{ data: Rec }>(marginToken, 0, 200)
      if (data?.records) {
        const _pairList = await getPairAddressList(factory, data.records)
        if (_pairList) {
          const pairList = _pairList.filter((l) => l.derivative !== ZERO)
          const [positionOrd, profitLossOrd] = await getOwnedPositions(trader, pairList)
          setOwnedPositions({
            positionOrd,
            profitLossOrd
          })
          setPositionLoaded(false)
        }
      }
    }, 1000),
    []
  )

  useEffect(() => {
    setPositionLoaded(true)
    if (trader && factory && marginToken) {
      void func(trader, factory, marginToken)
    }
  }, [trader, factory, marginToken])

  return {
    loaded: positionLoaded,
    ownedPositions,
    getOwnedPositions: func
  }
}
