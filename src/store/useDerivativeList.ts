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

export const getDerAddressList = async (address: string, list: (typeof derivativeList)[]) => {
  const output = Object.create(null)
  const calls = list.map((derivative) => ({
    name: 'getDerivative',
    params: [derivative.token],
    address
  }))

  const response = await multicall(factoryAbi, calls)

  response.forEach(([address]: string[], index: number) => {
    output[list[index].name] = {
      ...output[list[index].name],
      token: calls[index].params[0],
      derivative: address
    }
  })
  // console.info(output)
  return output
}

export const getPosMaxLeverage = async (list: DerAddressList) => {
  let output = Object.create(null)
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
  // console.info(output)
  return output
}

const useDerivativeListStore = create<DerivativeListState>((set) => ({
  derivativeList: [],
  derAddressList: null,
  posMaxLeverage: null,
  derAddressListLoaded: false,
  derivativeListLoaded: false,
  posMaxLeverageLoaded: false,
  getDerivativeList: async (marginTokenAddress: string) => {
    const { data } = await getDerivativeList(marginTokenAddress)
    if (data) {
      const records = data?.records ?? []
      const filter = records.filter((r: Rec) => r.open)

      set({
        derivativeList: filter,
        derivativeListLoaded: true
      })
    }
  },
  getDerAddressList: async (address: string, list: (typeof derivativeList)[]) => {
    const derAddressList = await getDerAddressList(address, list)

    set({
      derAddressList,
      derAddressListLoaded: true
    })
  },
  getPosMaxLeverage: async (list: DerAddressList) => {
    const posMaxLeverage = await getPosMaxLeverage(list)

    set({
      posMaxLeverage,
      posMaxLeverageLoaded: true
    })
  },
  reset: (data: { derAddressList?: null; posMaxLeverage?: null }) => {
    set((state) => ({ ...state, ...data }))
  }
}))

export { useDerivativeListStore }
