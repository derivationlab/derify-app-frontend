import { BigNumber } from 'ethers'
import { isEmpty, debounce } from 'lodash'

import { useCallback, useEffect, useState } from 'react'

import { getDerivativeList } from '@/api'
import { ZERO } from '@/config'
import DerifyDerivativAbi from '@/config/abi/DerifyDerivative.json'
import { getPairAddressList } from '@/store'
import { PositionSideTypes, PositionTriggerTypes, Rec } from '@/typings'
import multicall, { Call } from '@/utils/multicall'
import { bnMul, formatUnits } from '@/utils/tools'

const priceFormat = ({ isUsed, stopPrice }: { isUsed: boolean; stopPrice: BigNumber }): string =>
  isUsed ? formatUnits(stopPrice, 8) : '--'

const getOwnedPositions = async (trader: string, list: Rec[]): Promise<Rec[][]> => {
  const calls: Rec[] = []
  const positionOrd: Rec[] = []
  const profitLossOrd: Rec[] = []
  /**
   {
    "margin_token": "0xD5eC82071D0c870BfBa60B58A0AA52E42A3BEFba",
    "token": "0x076C264Df30Ef6e24CB925617B1ad88Fc1F41000",
    "name": "BUSD/USD",
    "price_decimals": 2,
    "open": 1,
    "update_time": "2023-06-20T04:02:38.000Z",
    "derivative": "0x79269146ab3d145ceFdD3B447C9C6D3a7541a8a1"
}
   */
  try {
    list.forEach((l) => {
      calls.push({
        name: 'getTraderDerivativePositions',
        token: l.token,
        params: [trader],
        address: l.derivative,
        quoteToken: l.name.split('/')[0],
        derivative: l.name,
        decimals: l.price_decimals
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
            token: calls[i].token,
            decimals: calls[i].decimals,
            leverage: formatUnits(long.leverage, 8),
            pairAddress: calls[i].address,
            derivative: calls[i].derivative,
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
            token: calls[i].token,
            decimals: calls[i].decimals,
            leverage: formatUnits(short.leverage, 8),
            pairAddress: calls[i].address,
            derivative: calls[i].derivative,
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
              token: calls[i].token,
              price,
              volume,
              decimals: calls[i].decimals,
              pairAddress: calls[i].address,
              leverage: formatUnits(order.leverage),
              timestamp: String(order.timestamp),
              orderType: PositionTriggerTypes.Limit,
              derivative: calls[i].derivative,
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
              token: calls[i].token,
              price,
              volume,
              decimals: calls[i].decimals,
              pairAddress: calls[i].address,
              leverage: formatUnits(order.leverage),
              timestamp: String(order.timestamp),
              orderType: PositionTriggerTypes.Limit,
              derivative: calls[i].derivative,
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
            token: calls[i].token,
            price,
            volume,
            decimals: calls[i].decimals,
            pairAddress: calls[i].address,
            leverage: formatUnits(long.leverage),
            orderType: PositionTriggerTypes.StopProfit,
            timestamp: String(longOrderStopProfitPosition.timestamp),
            derivative: calls[i].derivative,
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
            token: calls[i].token,
            price,
            volume,
            decimals: calls[i].decimals,
            pairAddress: calls[i].address,
            leverage: formatUnits(long.leverage),
            orderType: PositionTriggerTypes.StopLoss,
            timestamp: String(longOrderStopLossPosition.timestamp),
            derivative: calls[i].derivative,
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
            token: calls[i].token,
            price,
            volume,
            decimals: calls[i].decimals,
            pairAddress: calls[i].address,
            leverage: formatUnits(short.leverage),
            orderType: PositionTriggerTypes.StopLoss,
            timestamp: String(shortOrderStopLossPosition.timestamp),
            derivative: calls[i].derivative,
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
            token: calls[i].token,
            price,
            volume,
            decimals: calls[i].decimals,
            pairAddress: calls[i].address,
            leverage: formatUnits(short.leverage),
            orderType: PositionTriggerTypes.StopProfit,
            timestamp: String(shortOrderStopProfitPosition.timestamp),
            derivative: calls[i].derivative,
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
      const pairList = Object.create(null)
      const { data } = await getDerivativeList(marginToken, 0, 100)
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
