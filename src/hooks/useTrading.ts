import { isEmpty } from 'lodash'
import { useSigner } from 'wagmi'
import { useParams } from 'react-router-dom'
import { useCallback, useMemo } from 'react'

import { OpeningType } from '@/zustand/useCalcOpeningDAT'
import { calcProfitOrLoss } from '@/hooks/helper'
import { inputParameterConversion } from '@/utils/tools'
import { estimateGas, setAllowance } from '@/utils/practicalMethod'
import { PositionTriggerTypes, PositionSideTypes, MarginTokenKeys } from '@/typings'
import { DEFAULT_MARGIN_TOKEN, findMarginToken, findToken } from '@/config/tokens'
import { getDerifyDerivativePairContract, getDerifyExchangeContract } from '@/utils/contractHelpers'

export const useOpeningPosition = () => {
  const { data: signer } = useSigner()

  const opening = useCallback(
    async (
      exchange: string,
      brokerId: string,
      qtAddress: string, // quote token address
      positionSide: PositionSideTypes,
      openingType: OpeningType,
      pricingType: string,
      openingPrice: string,
      posLeverage: number,
      openingSize: number,
      conversion?: boolean
    ): Promise<boolean> => {
      if (!signer) return false

      const c = getDerifyExchangeContract(exchange, signer)

      // getUintAmount?
      const _posLeverage = inputParameterConversion(posLeverage, 8)
      const _pricingType = findMarginToken(pricingType) ? 1 : 0
      const _openingType = conversion ? OpeningType.Market : openingType
      const _openingSize = inputParameterConversion(openingSize, 8)
      const _openingPrice = inputParameterConversion(openingPrice, 8)

      console.info([
        brokerId,
        qtAddress,
        positionSide,
        _openingType,
        _pricingType,
        _openingSize,
        _openingPrice,
        _posLeverage
      ])
      try {
        // const gasLimit = await estimateGas(c, 'openPosition', params, 0)
        const res = await c.openPosition(
          brokerId,
          qtAddress,
          positionSide,
          _openingType,
          _pricingType,
          _openingSize,
          _openingPrice,
          _posLeverage,
          {
            gasLimit: 3000000
          }
        )
        const receipt = await res.wait()
        return receipt.status
      } catch (e) {
        console.info(e)
        return false
      }
    },
    [signer]
  )

  return { opening }
}

export const useCloseAllPositions = () => {
  const { data: signer } = useSigner()

  const close = useCallback(
    async (exchange: string, brokerId: string): Promise<boolean> => {
      if (!signer) return false

      const c = getDerifyExchangeContract(exchange, signer)

      try {
        const gasLimit = await estimateGas(c, 'closeAllPositions', [brokerId], 0)
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

  return { close }
}

export const useCancelPosition = () => {
  const { data: signer } = useSigner()

  const close = useCallback(
    async (
      pairAddress: string,
      orderType: PositionTriggerTypes,
      positionSide: PositionSideTypes,
      timestamp: string
    ): Promise<boolean> => {
      let response: any = null

      if (!signer) return false

      const c = getDerifyDerivativePairContract(pairAddress, signer)

      try {
        if (orderType === PositionTriggerTypes.Limit) {
          const gasLimit = await estimateGas(c, 'cancelOrderedLimitPosition', [positionSide, timestamp], 0)
          response = await c.cancelOrderedLimitPosition(positionSide, timestamp, { gasLimit })
        } else {
          const gasLimit = await estimateGas(c, 'cancelOrderedStopPosition', [orderType - 1, positionSide], 0)
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

  return { close }
}

export const useCancelAllPositions = () => {
  const { data: signer } = useSigner()

  const cancel = useCallback(
    async (exchange: string): Promise<boolean> => {
      if (!signer) return false

      const c = getDerifyExchangeContract(exchange, signer)

      try {
        const gasLimit = await estimateGas(c, 'cancelAllOrderedPositions', [], 0)
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

  return { cancel }
}

export const useDepositMargin = () => {
  const { data: signer } = useSigner()

  const deposit = useCallback(
    async (exchange: string, amount: string, marginToken: string): Promise<boolean> => {
      if (!signer) return false
      console.info(amount)
      const c = getDerifyExchangeContract(exchange, signer)

      try {
        const _amount = inputParameterConversion(amount, 8)
        const approve = await setAllowance(signer, exchange, findToken(marginToken).tokenAddress, _amount)

        if (!approve) return false

        const gasLimit = await estimateGas(c, 'deposit', [_amount], 0)
        const res = await c.deposit(_amount, { gasLimit })
        const receipt = await res.wait()
        return receipt.status
      } catch (e) {
        console.info(e)
        return false
      }
    },
    [signer]
  )

  return { deposit }
}

export const useWithdrawMargin = () => {
  const { data: signer } = useSigner()

  const withdraw = useCallback(
    async (exchange: string, amount: string): Promise<boolean> => {
      if (!signer) return false

      const c = getDerifyExchangeContract(exchange, signer)

      try {
        const _amount = inputParameterConversion(amount, 8)

        const gasLimit = await estimateGas(c, 'withdraw', [_amount], 0)
        const res = await c.withdraw(_amount, { gasLimit })
        const receipt = await res.wait()
        return receipt.status
      } catch (e) {
        console.info(e)
        return false
      }
    },
    [signer]
  )

  return { withdraw }
}

export const useTakeProfitOrStopLoss = () => {
  const { data: signer } = useSigner()

  const takeProfitOrStopLoss = useCallback(
    async (
      pairAddress: string,
      positionSide: PositionSideTypes,
      takeProfitPrice: number,
      stopLossPrice: number
    ): Promise<boolean> => {
      if (!signer) return false

      const c = getDerifyDerivativePairContract(pairAddress, signer)
      const job = calcProfitOrLoss(takeProfitPrice, stopLossPrice)

      if (isEmpty(job)) return true

      const _stopLossPrice = inputParameterConversion(stopLossPrice, 8)
      const _takeProfitPrice = inputParameterConversion(takeProfitPrice, 8)
      const { method, stopType, orderStopType, cancelStopType } = job

      try {
        if (method === 'orderStopPosition') {
          const gasLimit = await estimateGas(
            c,
            'orderStopPosition',
            [positionSide, stopType, _takeProfitPrice, _stopLossPrice],
            0
          )
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
          const gasLimit = await estimateGas(c, 'cancelOrderedStopPosition', [stopType, positionSide], 0)
          const data = await c.cancelOrderedStopPosition(stopType, positionSide, { gasLimit })
          const receipt = await data.wait()
          return receipt.status
        }
        /**
         #### orderAndCancleStopPosition
         */
        if (method === 'orderAndCancelStopPosition') {
          const price = orderStopType === 0 ? _takeProfitPrice : _stopLossPrice

          const gasLimit = await estimateGas(
            c,
            'orderAndCancelStopPosition',
            [positionSide, orderStopType, price, cancelStopType],
            0
          )
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
    },
    [signer]
  )

  return { takeProfitOrStopLoss }
}

export const useClosePosition = () => {
  const { data: signer } = useSigner()

  const close = useCallback(
    async (
      exchange: string,
      brokerId: string,
      spotPrice: string,
      quoteToken: string,
      marginToken: string,
      positionSize: string,
      positionSide: PositionSideTypes,
      whetherStud?: boolean
    ): Promise<boolean> => {
      if (!signer) return false

      const c = getDerifyExchangeContract(exchange, signer)
      const qtAddress = findToken(quoteToken).tokenAddress

      let _positionSize

      if (whetherStud) {
        _positionSize = inputParameterConversion(positionSize, 8)
      } else {
        const calc = findMarginToken(marginToken) ? Number(positionSize) / Number(spotPrice) : positionSize
        _positionSize = inputParameterConversion(calc, 8)
      }

      try {
        const gasLimit = await estimateGas(c, 'closePosition', [brokerId, qtAddress, positionSide, _positionSize], 0)
        const res = await c.closePosition(brokerId, qtAddress, positionSide, _positionSize, { gasLimit })
        const receipt = await res.wait()
        return receipt.status
      } catch (e) {
        console.info(e)
        return false
      }
    },
    [signer]
  )

  return { close }
}

export const useMTokenFromRoute = () => {
  const params: any = useParams()

  return useMemo(() => {
    if (params?.id) {
      const find = findMarginToken(params.id)

      if (find) {
        return find.symbol
      } else {
        const local = localStorage.getItem('MARGIN_TOKEN')
        return local ? JSON.parse(local).state.marginToken : DEFAULT_MARGIN_TOKEN.symbol
      }
    }
    return DEFAULT_MARGIN_TOKEN.symbol
  }, [params.id]) as MarginTokenKeys
}

export const useMTokenForRoute = () => {
  const params: any = useParams()

  const find = useMemo(() => {
    if (params?.id) {
      return findMarginToken(params.id)
    }
  }, [params?.id])

  const marginToken = useMemo(() => {
    if (find) {
      return find.symbol
    } else {
      const local = localStorage.getItem('MARGIN_TOKEN')
      return local ? JSON.parse(local).state.marginToken : DEFAULT_MARGIN_TOKEN.symbol
    }
  }, [find])

  return {
    find,
    marginToken
  }
}
