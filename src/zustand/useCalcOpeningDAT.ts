import create from 'zustand'

import { VolumeState } from '@/zustand/types'
import { getUnitAmount, nonBigNumberInterception, safeInterceptionValues, toHexString } from '@/utils/tools'
import {
  getDerifyDerivativePairContract,
  getDerifyExchangeContract1,
  getMarginTokenPriceFeedContract
} from '@/utils/contractHelpers'
import { BASE_TOKEN_SYMBOL, findToken, MARGIN_TOKENS } from '@/config/tokens'
import { MarginTokenKeys } from '@/typings'
import pairs from '@/config/pairs'
import BN from 'bignumber.js'

export enum OpeningType {
  Market,
  Limit
}

const getMaxVolume = async (
  qtAddress: string, // quote token address
  trader: string,
  openingType: OpeningType,
  leverageNow: number,
  price: string,
  exchange: string
): Promise<number[]> => {
  const _price = toHexString(price)
  const _leverageNow = toHexString(leverageNow)
  const c = getDerifyExchangeContract1(exchange)


  /** debug
   {
    "BUSD": {
        "priceFeed": "0xa4AcE2040Fc7b058571eBe2E97a170f7889Aa079",
        "exchange": "0xcD92F4381e28217526c87524382225319Ce1d869",
        "rewards": "0xDB2524176778158C5554554F1f0C579Dd074b265",
        "factory": "0xcCC0E293daf9c03Ca57FB00E85D950c56d000C06"
    },
    "DRF": {
        "priceFeed": "0x47A074d38F787673D0946a2F24B9450B7AC03265",
        "exchange": "0xd1659CAceaCEF86EA4655c28eF5061B1b3aad311",
        "rewards": "0x0847758C248CaEa36529e6E64540bC5A4e9e103C",
        "factory": "0xE5a093D576E1b78B70600E09C6eD6a1BA6dD5985"
    }
}
   */

  const cc = getMarginTokenPriceFeedContract('0x47A074d38F787673D0946a2F24B9450B7AC03265')
  const r1 = await cc.getBusdAmountIn(getUnitAmount(1))
  const r2 = await cc.getBusdAmountOut(getUnitAmount(1))
  const r3 = await cc.getMarginTokenAmountIn(getUnitAmount(1))
  const r4 = await cc.getMarginTokenAmountOut(getUnitAmount(1))
  console.info(String(r1),String(r2),String(r3),String(r4))

  const data = await c.getTraderOpenUpperBound(qtAddress, trader, openingType, _price, _leverageNow)

  const { size, amount } = data

  return [Number(safeInterceptionValues(String(size), 8)), Number(safeInterceptionValues(String(amount), 8))]
}

const getTFRValue = async (address: string) => {
  const c = getDerifyDerivativePairContract(address)

  // todo 价值转换？

  const ratio = await c.tradingFeeRatio()

  return safeInterceptionValues(String(ratio), 8)
}

const useCalcOpeningDAT = create<VolumeState>((set, get) => ({
  tfr: 0, // trading fee ratio
  maxVolume: {},
  closingType: MARGIN_TOKENS[0].symbol as MarginTokenKeys,
  closingAmount: 0,
  openingType: OpeningType.Market,
  leverageNow: 30,
  openingPrice: 0,
  openingAmount: 0,
  updateOpeningType: (data: OpeningType) =>
    set(() => {
      // console.info('updateOpeningType:')
      // console.info(data)
      return { openingType: data }
    }),
  updateClosingType: (data: MarginTokenKeys) =>
    set(() => {
      // console.info('updateClosingType:')
      // console.info(data)
      return { closingType: data }
    }),
  updateLeverageNow: (data: OpeningType) =>
    set(() => {
      // console.info('updateLeverageNow:')
      // console.info(data)
      return { leverageNow: data }
    }),
  updateOpeningPrice: (data: OpeningType) =>
    set(() => {
      // console.info('updateOpeningPrice:')
      // console.info(data)
      return { openingPrice: data }
    }),
  updateOpeningAmount: (data: OpeningType) =>
    set(() => {
      // console.info('updateOpeningAmount:')
      // console.info(data)
      return { openingAmount: data }
    }),
  updateClosingAmount: (data: OpeningType) =>
    set(() => {
      // console.info('updateClosingAmount:')
      // console.info(data)
      return { closingAmount: data }
    }),
  fetchMaxVolume: async (
    qtAddress: string,
    trader: string,
    price: string,
    exchange: string,
    marginToken: MarginTokenKeys
  ) => {
    console.info(qtAddress, trader, get().openingType, get().leverageNow, price, exchange)
    const [size, swap] = await getMaxVolume(
      qtAddress,
      trader,
      get().openingType,
      get().leverageNow,
      price,
      exchange
    )

    console.info('getMaxVolume:')
    console.info([size, swap])

    set({
      maxVolume: {
        [marginToken]: swap,
        [findToken(qtAddress).symbol]: size
      }
    })
  },
  fetchTFRValue: async (
    address: string
  ) => {
    console.info(address)
    const data = await getTFRValue(
      address
    )

    console.info('fetchTFRValue-不完整:')
    console.info(data)

    set({ tfr: Number(data) })
  }
}))

export { useCalcOpeningDAT }
