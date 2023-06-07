import { BigNumberish } from 'ethers'
import { create } from 'zustand'

import { getDerivativeList } from '@/api'
import { ZERO } from '@/config'
import derivativeAbi from '@/config/abi/DerifyDerivative.json'
import factoryAbi from '@/config/abi/DerifyFactory.json'
import DerifyFactoryAbi from '@/config/abi/DerifyFactory.json'
import { DerivativeListState } from '@/store/types'
import { Rec } from '@/typings'
import multicall, { Call } from '@/utils/multicall'
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

const getTradingPairDeployStatus = async (list: (typeof derivativeList)[], factory: string) => {
  let output = Object.create(null)
  const calls = list.map((derivative) => ({
    name: 'getDerivative',
    params: [derivative.token],
    address: factory
  }))

  const response = await multicall(DerifyFactoryAbi, calls)

  response.forEach(([data]: string[], index: number) => {
    output = {
      ...output,
      [list[index].name]: data === ZERO ? 0 : 1
    }
  })
  return output
}

export const getPosMaxLeverage = async (list: any) => {
  const calls: Call[] = []
  let output = Object.create(null)
  try {
    const keys = Object.keys(list)
    keys.forEach((l) => {
      if (list[l].derivative !== ZERO)
        calls.push({
          name: 'maxLeverage',
          address: list[l].derivative
        })
    })
    const response = await multicall(derivativeAbi, calls)

    response.forEach((leverage: BigNumberish, index: number) => {
      output = {
        ...output,
        [keys[index]]: formatUnits(String(leverage), 8)
      }
    })

    return output
  } catch (e) {
    console.info(e)
    return null
  }
}

const useDerivativeListStore = create<DerivativeListState>((set, get) => ({
  derivativeList: [],
  derAddressList: null,
  posMaxLeverage: null,
  derivativeListOrigin: [],
  derAddressListLoaded: false,
  derivativeListLoaded: false,
  posMaxLeverageLoaded: false,
  getDerivativeList: async (marginTokenAddress: string, page = 0, size = 50) => {
    const { data } = await getDerivativeList(marginTokenAddress, page, size)

    const records = data?.records ?? []
    const filter = records.filter((r: Rec) => r.open)
    set({
      derivativeList: filter.length ? filter : [],
      derivativeListOrigin: records,
      derivativeListLoaded: true
    })
  },
  getDerAddressList: async (factory: string) => {
    const derAddressList = await getDerAddressList(factory, get().derivativeListOrigin)
    set({ derAddressList, derAddressListLoaded: true })
  },
  getPosMaxLeverage: async () => {
    const posMaxLeverage = await getPosMaxLeverage(get().derAddressList)
    set({ posMaxLeverage, posMaxLeverageLoaded: true })
  }
}))

export { useDerivativeListStore }
