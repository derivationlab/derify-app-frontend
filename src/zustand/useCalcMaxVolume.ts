import create from 'zustand'

import { VolumeState } from '@/zustand/types'
import { safeInterceptionValues, toHexString } from '@/utils/tools'
import { getDerifyExchangeContract1 } from '@/utils/contractHelpers'
import { findToken } from '@/config/tokens'
import { MarginTokenKeys } from '@/typings'

export enum OpeningType {
  Market,
  Limit
}

const getMaxVolume = async (
  quoteTokenAddress: string,
  trader: string,
  openingType: OpeningType,
  leverageNow: number,
  price: string,
  exchange: string
): Promise<number[]> => {
  const _price = toHexString(price)
  const _leverageNow = toHexString(leverageNow)
  const c = getDerifyExchangeContract1(exchange)

  const data = await c.getTraderOpenUpperBound(quoteTokenAddress, trader, openingType, _price, _leverageNow)

  const { size, amount } = data

  return [Number(safeInterceptionValues(String(size), 8)), Number(safeInterceptionValues(String(amount), 8))]
}

const useCalcMaxVolume = create<VolumeState>((set, get) => ({
  maxVolume: {},
  openingType: OpeningType.Market,
  leverageNow: 30,
  openingPrice: 0,
  updateOpeningType: (data: OpeningType) =>
    set(() => {
      // console.info('updateOpeningType:')
      // console.info(data)
      return { openingType: data }
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
  fetch: async (
    quoteTokenAddress: string,
    trader: string,
    price: string,
    exchange: string,
    marginToken: MarginTokenKeys
  ) => {
    console.info(quoteTokenAddress, trader, get().openingType, get().leverageNow, price, exchange)
    const [size, swap] = await getMaxVolume(
      quoteTokenAddress,
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
        [findToken(quoteTokenAddress).symbol]: size
      }
    })
  }
}))

export { useCalcMaxVolume }
