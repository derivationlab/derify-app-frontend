import { create } from 'zustand'

import { findToken } from '@/config/tokens'
import { OpeningState } from '@/store/types'
import { MarginTokenKeys } from '@/typings'
import { getDerifyDerivativeContract, getDerifyExchangeContract } from '@/utils/contractHelpers'
import { formatUnits, inputParameterConversion, safeInterceptionValues } from '@/utils/tools'

export enum OpeningType {
  Market,
  Limit
}

const getMaxVolume = async (
  quoteToken: string, // quote token address
  trader: string,
  openingType: OpeningType,
  leverageNow: number,
  price: string,
  exchange: string
): Promise<string[] | 'error'> => {
  const _price = inputParameterConversion(price, 8)
  const _leverageNow = inputParameterConversion(leverageNow, 8)
  const c = getDerifyExchangeContract(exchange)

  try {
    const data = await c.getTraderOpenUpperBound(quoteToken, trader, openingType, _price, _leverageNow)

    const { size, amount } = data

    return [formatUnits(String(size), 8), formatUnits(String(amount), 8)]
  } catch (e) {
    // console.info(e)
    return 'error'
  }
}

const getTFRValue = async (address: string) => {
  const c = getDerifyDerivativeContract(address)

  // todo 价值转换？

  const ratio = await c.tradingFeeRatio()

  return safeInterceptionValues(String(ratio), 8)
}

const useOpeningStore = create<OpeningState>((set, get) => ({
  tfr: 0, // trading fee ratio
  maxVolume: {},
  maxVolumeLoaded: false,
  closingType: '',
  closingAmount: '0',
  openingType: OpeningType.Market,
  leverageNow: 30,
  openingPrice: '0',
  openingAmount: '0',
  updateOpeningType: (data: OpeningType) =>
    set(() => {
      // console.info('updateOpeningType:')
      // console.info(data)
      return { openingType: data }
    }),
  updateClosingType: (data: string) =>
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
  updateOpeningPrice: (data: string) =>
    set(() => {
      // console.info('updateOpeningPrice:')
      // console.info(data)
      return { openingPrice: data }
    }),
  updateOpeningAmount: (data: string) =>
    set(() => {
      // console.info('updateOpeningAmount:')
      // console.info(data)
      return { openingAmount: data }
    }),
  updateClosingAmount: (data: string) =>
    set(() => {
      // console.info('updateClosingAmount:')
      // console.info(data)
      return { closingAmount: data }
    }),
  fetchMaxVolume: async (
    quoteToken: string,
    trader: string,
    price: string,
    exchange: string,
    marginToken: MarginTokenKeys
  ) => {
    // console.info(quoteToken, trader, get().openingType, get().leverageNow, price, exchange)
    const data = await getMaxVolume(quoteToken, trader, get().openingType, get().leverageNow, price, exchange)

    // console.info('getMaxVolume:')
    // console.info([size, swap])

    if (data !== 'error') {
      const [size, swap] = data
      set({
        maxVolume: {
          [marginToken]: swap,
          [findToken(quoteToken).symbol]: size
        },
        maxVolumeLoaded: true
      })
    }
  },
  fetchTFRValue: async (address: string) => {
    const data = await getTFRValue(address)

    set({ tfr: Number(data) })
  }
}))

export { useOpeningStore }
