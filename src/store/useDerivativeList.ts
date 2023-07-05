import { create } from 'zustand'

import { getDerivativeList } from '@/api'
import { ZERO } from '@/config'
import factoryAbi from '@/config/abi/DerifyFactory.json'
import { DerivativeListState } from '@/store/types'
import { Rec } from '@/typings'
import multicall from '@/utils/multicall'

export type DerAddressList = { [key: string]: { token: string; derivative: string } }

export const derivativeList = {
  open: '',
  name: '',
  token: '',
  derivative: '',
  update_time: '',
  margin_token: '',
  price_decimals: 2
}

export const getPairAddressList = async (
  factory: string,
  list: (typeof derivativeList)[]
): Promise<(typeof derivativeList)[] | null> => {
  const calls = list.map((derivative) => ({
    name: 'getDerivative',
    params: [derivative.token],
    address: factory
  }))

  try {
    const response = await multicall(factoryAbi, calls)

    if (response.length) {
      const output = response.map(([address]: string[], index: number) => ({ ...list[index], derivative: address }))
      // console.info(output)
      return output
    }

    return null
  } catch (e) {
    console.info(e)
    return null
  }
}

const useDerivativeListStore = create<DerivativeListState>((set, get) => ({
  derivativeList: [],
  derivativeListLoaded: false,
  getDerivativeList: async (marginToken: string, factory: string, page = 0) => {
    const { data } = await getDerivativeList(marginToken, page)
    const records = data?.records ?? []
    // condition1: open
    const list = await getPairAddressList(
      factory,
      records.filter((r: Rec) => r.open)
    )
    const _list = list ?? []
    // condition2: not zero address
    const output = _list.filter((l) => l.derivative !== ZERO)
    set({ derivativeList: output, derivativeListLoaded: true })
  }
}))

export { useDerivativeListStore }
