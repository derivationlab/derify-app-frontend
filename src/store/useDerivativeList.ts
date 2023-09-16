import { create } from 'zustand'

import { getDerivativeList } from '@/api'
import { ZERO } from '@/config'
import { getPairAddressList } from '@/funcs/helper'
import { DerivativeListState } from '@/store/types'

export const derivativeList = {
  open: '',
  name: '',
  token: '',
  derivative: '',
  update_time: '',
  margin_token: '',
  price_decimals: 2
}

const useDerivativeListStore = create<DerivativeListState>((set) => ({
  derivativeList: [],
  derivativeListOpen: [],
  derivativeListLoaded: false,
  getDerivativeList: async (marginToken: string, factory: string, page = 0) => {
    const { data } = await getDerivativeList(marginToken, page)
    const records = data?.records ?? []
    const pairList = await getPairAddressList(factory, records)
    const deployed = (pairList ?? []).filter((l) => l.derivative !== ZERO) // deployed, get pair address config
    const inTrading = deployed.filter((r) => r.open) // opening
    set({
      derivativeList: deployed,
      derivativeListOpen: inTrading,
      derivativeListLoaded: true
    })
  }
}))

export { useDerivativeListStore }
