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
  getDerivativeList: async (marginToken: string, factory: string, page = 0) => {
    const { data } = await getDerivativeList(marginToken, page)
    const records = data?.records ?? []
    console.info(records)
    // condition1: open
    const list = await getPairAddressList(
      factory,
      records.filter((r: Rec) => r.open)
    )
    const _list = list ?? []
    // condition2: not zero address
    const output = _list.filter((l) => l.derivative !== ZERO)
    console.info(output)
    set({ derivativeList: output, derivativeListLoaded: true })
  },
  getPosMaxLeverage: async () => {
    const posMaxLeverage = await getPosMaxLeverage(get().derAddressList)
    set({ posMaxLeverage, posMaxLeverageLoaded: true })
  }
}))

export { useDerivativeListStore }
