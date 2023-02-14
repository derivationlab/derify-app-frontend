import { useSigner } from 'wagmi'
import { useCallback } from 'react'

import { estimateGas, setAllowance } from '@/utils/practicalMethod'
import { OrderTypes, PositionSide } from '@/store/contract/helper'
import { getDerifyDerivativePairContract, getDerifyExchangeContract1 } from '@/utils/contractHelpers'
import { OpeningType } from '@/zustand/useCalcOpeningDAT'
import { findMarginToken, findToken } from '@/config/tokens'
import { toFloorNum, toHexString } from '@/utils/tools'

const checkSystemQuotas = (pricingType: string, openingSize: string, openingType: OpeningType, positionSide: PositionSide, openingMaxLimit: string) => {
  if (positionSide === PositionSide.twoWay || openingType !== OpeningType.Market) return openingSize

}

export const useOpeningPosition = () => {
  const { data: signer } = useSigner()

  const opening = useCallback(
    async (
      exchange: string,
      brokerId: string,
      qtAddress: string, // quote token address
      positionSide: PositionSide,
      openingType: OpeningType,
      pricingType: string,
      openingPrice: string,
      posLeverage: number,
      openingSize: string,
      openingMaxLimit: string,
      conversion?: boolean
    ): Promise<boolean> => {
      if (!signer) return false

      const c = getDerifyExchangeContract1(exchange, signer)

      const _posLeverage = toFloorNum(posLeverage)
      const _pricingType = findMarginToken(pricingType) ? 1 : 0
      const _openingType = conversion ? OpeningType.Market : openingType
      const _openingPrice = toFloorNum(openingPrice)

      const params = [brokerId, qtAddress, positionSide, _openingType, _pricingType, _openingPrice, _posLeverage]

      try {
        const gasLimit = await estimateGas(c, 'openPosition', params, 0)
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

  return { opening }
}

export const useCloseAllPositions = () => {
  const { data: signer } = useSigner()

  const close = useCallback(
    async (exchange: string, brokerId: string): Promise<boolean> => {
      if (!signer) return false

      const c = getDerifyExchangeContract1(exchange, signer)

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

export const useCloseOnePosition = () => {
  const { data: signer } = useSigner()

  const closeOne = useCallback(
    async (address: string, orderType: OrderTypes, positionSide: PositionSide, timestamp: string): Promise<boolean> => {
      let response: any = null

      if (!signer) return false

      const c = getDerifyDerivativePairContract(address, signer)

      try {
        if (orderType === OrderTypes.Limit) {
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

  return { closeOne }
}

export const useCancelAllPositions = () => {
  const { data: signer } = useSigner()

  const cancel = useCallback(
    async (exchange: string): Promise<boolean> => {
      if (!signer) return false

      const c = getDerifyExchangeContract1(exchange, signer)

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

      const c = getDerifyExchangeContract1(exchange, signer)

      try {
        const _amount = toHexString(amount)
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

      const c = getDerifyExchangeContract1(exchange, signer)

      try {
        const _amount = toHexString(amount)

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
