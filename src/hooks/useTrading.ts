import { useSigner } from 'wagmi'
import { useCallback } from 'react'

import { estimateGas } from '@/utils/practicalMethod'
import { PositionSide } from '@/store/contract/helper'
import { getDerifyExchangeContract1 } from '@/utils/contractHelpers'
import { OpeningType } from '@/zustand/useCalcMaxVolume'

export const useOpeningPosition = () => {
  const { data: signer } = useSigner()

  const opening = useCallback(
    async (exchange: string,
           brokerId: string,
           quoteTokenAddress: string,
           positionSide:PositionSide,
           openingType: OpeningType,
           isOrderConversion?: boolean
           ): Promise<boolean> => {
      if (!signer) return false

      const c = getDerifyExchangeContract1(exchange, signer)

      const _openingType = isOrderConversion ? OpeningType.Market : openingType

      const params = [
        brokerId,
        quoteTokenAddress,
        positionSide,
        _openingType
      ]

      try {
        const gasLimit = await estimateGas(c, 'openPosition', [], 0)
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
