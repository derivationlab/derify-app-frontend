import BN from 'bignumber.js'
import { isEmpty } from 'lodash'
import type { Signer } from 'ethers'

import pairs from '@/config/pairs'
import { BASE_TOKEN_SYMBOL, findMarginToken } from '@/config/tokens'
import { OrderTypes, PositionSide } from '@/store/contract/helper'
import { estimateGas } from '@/utils/practicalMethod'
import {
  getDerifyExchangeContract,
  getDerifyExchangeContract1,
  getDerifyDerivativePairContract
} from '@/utils/contractHelpers'
import { nonBigNumberInterception, safeInterceptionValues, toFloorNum, toHexString } from '@/utils/tools'
import { OpeningType } from '@/zustand/useCalcOpeningDAT'

class Trader {
  minimumOpenPositionLimit = (side: PositionSide, price: string, volume: string | number, symbol: string): boolean => {
    const limit = 500
    const calcU = findMarginToken(symbol) ? new BN(volume) : new BN(volume).times(price) // U

    return calcU.isLessThan(limit)
  }

  closeSomePosition = async (
    signer: Signer,
    brokerId: string,
    symbol: string,
    token: string,
    side: string,
    size: string,
    amount: number,
    spotPrice: string,
    whetherStud?: boolean
  ): Promise<boolean> => {
    let SIZE_OUTPUT = ''

    const contract = getDerifyExchangeContract(signer)

    if (whetherStud) {
      SIZE_OUTPUT = toFloorNum(size)
    } else {
      const AMOUNT_BN = new BN(amount)
      const SIZE_BN = symbol === BASE_TOKEN_SYMBOL ? AMOUNT_BN.div(spotPrice) : AMOUNT_BN
      SIZE_OUTPUT = toFloorNum(String(SIZE_BN))
    }

    // console.info(`func: closePosition size`, size, SIZE_OUTPUT)

    try {
      const gasLimit = await estimateGas(contract, 'closePosition', [brokerId, token, side, SIZE_OUTPUT], 0)
      const res = await contract.closePosition(brokerId, token, side, SIZE_OUTPUT, { gasLimit })
      const receipt = await res.wait()
      return receipt.status
    } catch (e) {
      console.info(e)
      return false
    }
  }
}

export default new Trader()
