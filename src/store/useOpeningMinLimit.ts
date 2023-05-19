import { create } from 'zustand'

import { OpeningMinLimitState } from '@/store/types'
import { getDerifyExchangeContract } from '@/utils/contractHelpers'
import { formatUnits } from '@/utils/tools'

const getOpeningMinLimit = async (address: string): Promise<string> => {
  const contract = getDerifyExchangeContract(address)
  const response = await contract.minOpenAmount()
  return formatUnits(response, 8)
}

const useOpeningMinLimitStore = create<OpeningMinLimitState>((set) => ({
  openingMinLimit: '0',
  openingMinLimitLoaded: false,
  getOpeningMinLimit: async (address: string) => {
    const data = await getOpeningMinLimit(address)

    console.info('getOpeningMinLimit:')
    console.info(data)

    set({ openingMinLimit: data, openingMinLimitLoaded: true })
  }
}))

export { useOpeningMinLimitStore }
