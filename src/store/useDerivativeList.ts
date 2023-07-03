import { BigNumberish } from 'ethers'
import { create } from 'zustand'

import { getDerivativeList } from '@/api'
import { ZERO } from '@/config'
import derivativeAbi from '@/config/abi/DerifyDerivative.json'
import factoryAbi from '@/config/abi/DerifyFactory.json'
import { DerivativeListState } from '@/store/types'
import { Rec } from '@/typings'
import multicall, { Call } from '@/utils/multicall'
import { formatUnits } from '@/utils/tools'

export type DerAddressList = { [key: string]: { token: string; derivative: string } }

export const derivativeList = {
  open: '',
  name: '',
  token: '',
  margin_token: '',
  price_decimals: 2
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
    console.info(e)
    return null
  }
}

// const getTradingPairDeployStatus = async (list: (typeof derivativeList)[], factory: string) => {
//   let output = Object.create(null)
//   const calls = list.map((derivative) => ({
//     name: 'getDerivative',
//     params: [derivative.token],
//     address: factory
//   }))
//
//   const response = await multicall(DerifyFactoryAbi, calls)
//
//   response.forEach(([data]: string[], index: number) => {
//     output = {
//       ...output,
//       [list[index].name]: data === ZERO ? 0 : 1
//     }
//   })
//   return output
// }

export const getPosMaxLeverage = async (list: any) => {
  const calls: Call[] = []
  let output = Object.create(null)
  const _list = list ?? Object.create(null)
  try {
    const keys = Object.keys(_list)
    keys.forEach((l) => {
      calls.push({
        name: 'maxLeverage',
        address: _list[l].derivative
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
  getDerivativeList: async (marginTokenAddress: string, page = 0) => {
    const { data } = await getDerivativeList(marginTokenAddress, page)

    const records = data?.records ?? []
    const filter = records.filter((r: Rec) => r.open)
    // console.info(filter)
    set({
      derivativeList: filter,
      derivativeListOrigin: records,
      derivativeListLoaded: true
    })
  },
  getDerAddressList: async (factory: string) => {
    const output = Object.create(null)
    const records = await getDerAddressList(factory, get().derivativeListOrigin)
    if (records) {
      for (const key in records) {
        if (Object.prototype.hasOwnProperty.call(records, key))
          if (records[key].derivative !== ZERO) output[key] = records[key]
      }
      // console.info(output)
      set({ derAddressList: output, derAddressListLoaded: true })
    } else {
      set({ derAddressList: null, derAddressListLoaded: true })
    }
  },
  getPosMaxLeverage: async () => {
    const posMaxLeverage = await getPosMaxLeverage(get().derAddressList)
    set({ posMaxLeverage, posMaxLeverageLoaded: true })
  }
}))

export { useDerivativeListStore }
