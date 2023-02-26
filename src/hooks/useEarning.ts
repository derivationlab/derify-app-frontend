import { useSigner } from 'wagmi'
import { useCallback } from 'react'
import { isEmpty } from 'lodash'

import { OpeningType } from '@/zustand/useCalcOpeningDAT'
import { calcProfitOrLoss } from '@/hooks/helper'
import { inputParameterConversion } from '@/utils/tools'
import { OrderTypes, PositionSide } from '@/store/contract/helper'
import { estimateGas, setAllowance } from '@/utils/practicalMethod'
import { findMarginToken, findToken } from '@/config/tokens'
import {
  getDerifyDerivativePairContract,
  getDerifyExchangeContract1,
  getDerifyRewardsContract1
} from '@/utils/contractHelpers'

export const useWithdrawPositionReward = () => {
  const { data: signer } = useSigner()

  const withdraw = useCallback(
    async (rewards: string): Promise<boolean> => {
      if (!signer) return false
      const c = getDerifyRewardsContract1(rewards, signer)

      try {
        const res = await c.withdrawPositionReward()
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

export const useWithdrawMargin = () => {
  const { data: signer } = useSigner()

  const withdraw = useCallback(
    async (exchange: string, amount: string): Promise<boolean> => {
      if (!signer) return false

      const c = getDerifyExchangeContract1(exchange, signer)

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
      positionSide: PositionSide,
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
      positionSide: PositionSide,
      whetherStud?: boolean
    ): Promise<boolean> => {
      if (!signer) return false

      const c = getDerifyExchangeContract1(exchange, signer)
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
