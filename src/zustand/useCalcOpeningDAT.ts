import create from 'zustand'

import { VolumeState } from '@/zustand/types'
import { MarginTokenKeys } from '@/typings'
import { findToken, MARGIN_TOKENS } from '@/config/tokens'
import { inputParameterConversion, safeInterceptionValues } from '@/utils/tools'
import { getDerifyDerivativePairContract, getDerifyExchangeContract1 } from '@/utils/contractHelpers'

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
  const _price = inputParameterConversion(price, 8)
  const _leverageNow = inputParameterConversion(leverageNow, 8)
  const c = getDerifyExchangeContract1(exchange)

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
  updateOpeningAmount: (data: number) =>
    set(() => {
      // console.info('updateOpeningAmount:')
      // console.info(data)
      return { openingAmount: data }
    }),
  updateClosingAmount: (data: number) =>
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
    // console.info(qtAddress, trader, get().openingType, get().leverageNow, price, exchange)
    const [size, swap] = await getMaxVolume(qtAddress, trader, get().openingType, get().leverageNow, price, exchange)

    // console.info('getMaxVolume:')
    // console.info([size, swap])

    set({
      maxVolume: {
        [marginToken]: swap,
        [findToken(qtAddress).symbol]: size
      }
    })
  },
  fetchTFRValue: async (address: string) => {
    console.info(address)
    const data = await getTFRValue(address)

    console.info('fetchTFRValue-不完整:')
    console.info(data)

    set({ tfr: Number(data) })
  }
}))

export { useCalcOpeningDAT }
