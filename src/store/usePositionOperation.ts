import { create } from 'zustand'

import { PositionOperationState, Rec } from '@/store/types'
import { PositionOrderTypes } from '@/typings'
import { getDerifyExchangeContract } from '@/utils/contractHelpers'
import { formatUnits, inputParameterConversion } from '@/utils/tools'

const getDisposableAmount = async (
  quoteTokenAddress: string,
  trader: string,
  openingType: PositionOrderTypes,
  leverageNow: number,
  price: string,
  exchange: string
): Promise<string[] | 'error'> => {
  const _price = inputParameterConversion(price, 8)
  const _leverageNow = inputParameterConversion(leverageNow, 8)
  const c = getDerifyExchangeContract(exchange)

  try {
    const data = await c.getTraderOpenUpperBound(quoteTokenAddress, trader, openingType, _price, _leverageNow)

    const { size, amount } = data

    return [formatUnits(String(size), 8), formatUnits(String(amount), 8)]
  } catch (e) {
    // console.info(e)
    return 'error'
  }
}

const usePositionOperationStore = create<PositionOperationState>((set, get) => ({
  openingType: PositionOrderTypes.Market,
  leverageNow: 30,
  closingType: '',
  openingPrice: '0',
  closingAmount: '0',
  openingAmount: '0',
  disposableAmount: null,
  disposableAmountLoaded: false,
  updateOpeningType: (data: PositionOrderTypes) =>
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
  updateLeverageNow: (data: PositionOrderTypes) =>
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
  getDisposableAmount: async (quoteToken: Rec, trader: string, price: string, exchange: string, marginToken: Rec) => {
    const data = await getDisposableAmount(
      quoteToken.address,
      trader,
      get().openingType,
      get().leverageNow,
      price,
      exchange
    )

    // console.info('getMaxVolume:')
    // console.info([size, swap])

    if (data !== 'error') {
      const [size, swap] = data
      set({
        disposableAmount: {
          [quoteToken.symbol]: size,
          [marginToken.symbol]: swap
        },
        disposableAmountLoaded: true
      })
    }
  }
}))

export { usePositionOperationStore }
