import { create } from 'zustand'

import { MarginPriceState } from '@/store/types'
import { getPriceFeedContract } from '@/utils/contractHelpers'
import { formatUnits } from '@/utils/tools'

const getMarginPrice = async (address: string): Promise<string> => {
  const contract = getPriceFeedContract(address)
  const response = await contract.getMarginTokenPrice()
  return formatUnits(response, 8)
}

const useMarginPriceStore = create<MarginPriceState>((set) => ({
  marginPrice: '0',
  marginPriceLoaded: false,
  getMarginPrice: async (address: string) => {
    const data = await getMarginPrice(address)

    console.info('getMarginPrice:')
    console.info(data)

    set({ marginPrice: data, marginPriceLoaded: true })
  }
}))

export { useMarginPriceStore }
