import { BigNumberish } from 'ethers'
import { create } from 'zustand'

import { getDerivativeList } from '@/api'
import derivativeAbi from '@/config/abi/DerifyDerivative.json'
import factoryAbi from '@/config/abi/DerifyFactory.json'
import { DerivativeListState } from '@/store/types'
import { Rec } from '@/typings'
import multicall from '@/utils/multicall'
import { formatUnits } from '@/utils/tools'

export type DerAddressList = { [key: string]: { token: string; derivative: string } }

export const derivativeList = {
  open: '',
  name: '',
  token: '',
  margin_token: ''
}

export const getDerAddressList = async (factory: string, list: (typeof derivativeList)[]) => {
  const output = Object.create(null)
  const calls = list.map((derivative) => ({
    name: 'getDerivative',
    params: [derivative.token],
    address: factory
  }))

  try {
    const response = await multicall(factoryAbi, calls)

    if (response.length) {
      response.forEach(([address]: string[], index: number) => {
        output[list[index].name] = {
          ...output[list[index].name],
          token: calls[index].params[0],
          derivative: address
        }
      })
      return output
    }

    return null
  } catch (e) {
    return null
  }
}

export const getPosMaxLeverage = async (list: any) => {
  let output = Object.create(null)
  try {
    const keys = Object.keys(list)
    const calls = keys.map((l) => ({
      name: 'maxLeverage',
      address: list[l].derivative
    }))
    const response = await multicall(derivativeAbi, calls)

    response.forEach((leverage: BigNumberish, index: number) => {
      output = {
        ...output,
        [keys[index]]: formatUnits(String(leverage), 8)
      }
    })

    return output
  } catch (e) {
    return null
  }
}

const useDerivativeListStore = create<DerivativeListState>((set, get) => ({
  derivativeList: [],
  derAddressList: null,
  posMaxLeverage: null,
  derAddressListLoaded: false,
  derivativeListLoaded: false,
  posMaxLeverageLoaded: false,
  getDerivativeList: async (marginTokenAddress: string) => {
    const { data } = await getDerivativeList(marginTokenAddress)

    const records = data?.records ?? []
    const filter = records.filter((r: Rec) => r.open)
    set({ derivativeList: filter.length ? filter : [], derivativeListLoaded: true })
  },
  getDerAddressList: async (factory: string) => {
    const derAddressList = await getDerAddressList(factory, get().derivativeList)
    set({ derAddressList, derAddressListLoaded: true })
  },
  getPosMaxLeverage: async () => {
    const posMaxLeverage = await getPosMaxLeverage(get().derAddressList)
    set({ posMaxLeverage, posMaxLeverageLoaded: true })
  }
}))

export { useDerivativeListStore }