import { isEmpty } from 'lodash'
import { useSigner } from 'wagmi'

import { useCallback } from 'react'

import { calcProfitOrLoss } from '@/funcs/helper'
import { PositionOrderTypes, PositionSideTypes, PositionTriggerTypes } from '@/typings'
import { getExchangeContract, getDerivativeContract } from '@/utils/contractHelpers'
import { estimateGas } from '@/utils/estimateGas'
import { bnDiv, inputParameterConversion } from '@/utils/tools'

export const usePositionOperation = () => {
  const { data: signer } = useSigner()

  const increasePosition = async (
    exchange: string,
    brokerId: string,
    quoteToken: string,
    positionSide: PositionSideTypes,
    openingType: PositionOrderTypes,
    pricingType: string,
    openingPrice: string,
    posLeverage: number,
    openingSize: string,
    conversion?: boolean
  ): Promise<boolean> => {
    if (!signer) return false

    const c = getExchangeContract(exchange, signer)

    const _posLeverage = inputParameterConversion(posLeverage, 8)
    const _pricingType = 1
    const _openingType = conversion ? PositionOrderTypes.Market : openingType
    const _openingSize = inputParameterConversion(openingSize, 8)
    const _openingPrice = inputParameterConversion(openingPrice, 8)

    try {
      const gasLimit = await estimateGas(c, 'openPosition', [
        brokerId,
        quoteToken,
        positionSide,
        _openingType,
        _pricingType,
        _openingSize,
        _openingPrice,
        _posLeverage
      ])
      const res = await c.openPosition(
        brokerId,
        quoteToken,
        positionSide,
        _openingType,
        _pricingType,
        _openingSize,
        _openingPrice,
        _posLeverage,
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

  const closePosition = useCallback(
    async (
      exchange: string,
      brokerId: string,
      spotPrice: string,
      quoteToken: string,
      closeAmount: string,
      positionSize: string,
      positionSide: PositionSideTypes,
      whetherStud?: boolean
    ): Promise<boolean> => {
      let _positionSize

      if (!signer) return false

      const c = getExchangeContract(exchange, signer)

      if (whetherStud) {
        _positionSize = inputParameterConversion(positionSize, 8)
      } else {
        const size = bnDiv(closeAmount, spotPrice)
        _positionSize = inputParameterConversion(size, 8)
      }

      try {
        const gasLimit = await estimateGas(c, 'closePosition', [brokerId, quoteToken, positionSide, _positionSize])
        const res = await c.closePosition(brokerId, quoteToken, positionSide, _positionSize, { gasLimit })
        const receipt = await res.wait()
        return receipt.status
      } catch (e) {
        console.info(e)
        return false
      }
    },
    [signer]
  )

  const cancelPosition = useCallback(
    async (
      pairAddress: string,
      orderType: PositionTriggerTypes,
      positionSide: PositionSideTypes,
      timestamp: string
    ): Promise<boolean> => {
      let response: any = null

      if (!signer) return false

      const c = getDerivativeContract(pairAddress, signer)

      try {
        if (orderType === PositionTriggerTypes.Limit) {
          const gasLimit = await estimateGas(c, 'cancelOrderedLimitPosition', [positionSide, timestamp])
          response = await c.cancelOrderedLimitPosition(positionSide, timestamp, { gasLimit })
        } else {
          const gasLimit = await estimateGas(c, 'cancelOrderedStopPosition', [orderType - 1, positionSide])
          response = await c.cancelOrderedStopPosition(orderType - 1, positionSide, { gasLimit })
        }

        const receipt = await response.wait()
        return receipt.status
      } catch (e) {
        console.info(e)
        return false
      }
    },
    [signer]
  )

  const closeAllPositions = useCallback(
    async (exchange: string, brokerId: string): Promise<boolean> => {
      if (!signer) return false

      const c = getExchangeContract(exchange, signer)

      try {
        const gasLimit = await estimateGas(c, 'closeAllPositions', [brokerId])
        const response = await c.closeAllPositions(brokerId, { gasLimit })
        const receipt = await response.wait()
        return receipt.status
      } catch (e) {
        console.info(e)
        return false
      }
    },
    [signer]
  )

  const cancelAllPositions = useCallback(
    async (exchange: string): Promise<boolean> => {
      if (!signer) return false

      const c = getExchangeContract(exchange, signer)

      try {
        const gasLimit = await estimateGas(c, 'cancelAllOrderedPositions', [])
        const response = await c.cancelAllOrderedPositions({ gasLimit })
        const receipt = await response.wait()
        return receipt.status
      } catch (e) {
        console.info(e)
        return false
      }
    },
    [signer]
  )

  const takeProfitOrStopLoss = async (
    pairAddress: string,
    positionSide: PositionSideTypes,
    takeProfitPrice: number,
    stopLossPrice: number
  ): Promise<boolean> => {
    if (!signer) return false

    const c = getDerivativeContract(pairAddress, signer)
    const job = calcProfitOrLoss(takeProfitPrice, stopLossPrice)

    if (isEmpty(job)) return true

    const _stopLossPrice = inputParameterConversion(stopLossPrice, 8)
    const _takeProfitPrice = inputParameterConversion(takeProfitPrice, 8)
    const { method, stopType, orderStopType, cancelStopType } = job

    try {
      if (method === 'orderStopPosition') {
        const gasLimit = await estimateGas(c, 'orderStopPosition', [
          positionSide,
          stopType,
          _takeProfitPrice,
          _stopLossPrice
        ])
        const data = await c.orderStopPosition(positionSide, stopType, _takeProfitPrice, _stopLossPrice, {
          gasLimit
        })
        const receipt = await data.wait()
        return receipt.status
      }
      /**
       #### cancleOrderedStopPosition
       */
      if (method === 'cancelOrderedStopPosition') {
        const gasLimit = await estimateGas(c, 'cancelOrderedStopPosition', [stopType, positionSide])
        const data = await c.cancelOrderedStopPosition(stopType, positionSide, { gasLimit })
        const receipt = await data.wait()
        return receipt.status
      }
      /**
       #### orderAndCancleStopPosition
       */
      if (method === 'orderAndCancelStopPosition') {
        const price = orderStopType === 0 ? _takeProfitPrice : _stopLossPrice

        const gasLimit = await estimateGas(c, 'orderAndCancelStopPosition', [
          positionSide,
          orderStopType,
          price,
          cancelStopType
        ])
        const data = await c.orderAndCancelStopPosition(positionSide, orderStopType, price, cancelStopType, {
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

  return {
    closePosition,
    cancelPosition,
    increasePosition,
    closeAllPositions,
    cancelAllPositions,
    takeProfitOrStopLoss
  }
}
