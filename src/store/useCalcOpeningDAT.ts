import create from 'zustand'

import { findToken } from '@/config/tokens'
import { VolumeState } from '@/store/types'
import { MarginTokenKeys } from '@/typings'
import { formatUnits, inputParameterConversion, safeInterceptionValues } from '@/utils/tools'
import { getDerifyDerivativePairContract, getDerifyExchangeContract } from '@/utils/contractHelpers'

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
): Promise<string[]> => {
  const _price = inputParameterConversion(price, 8)
  const _leverageNow = inputParameterConversion(leverageNow, 8)
  const c = getDerifyExchangeContract(exchange)

  try {
    const data = await c.getTraderOpenUpperBound(qtAddress, trader, openingType, _price, _leverageNow)

    const { size, amount } = data

    return [formatUnits(String(size), 8), formatUnits(String(amount), 8)]
  } catch (e) {
    console.info(e)
    return ['0', '0']
  }
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
      },
      maxVolumeLoaded: true
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
