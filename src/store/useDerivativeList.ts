import { create } from 'zustand'

import { getDerivativeList } from '@/api'
import factoryAbi from '@/config/abi/DerifyFactory.json'
import { DerivativeListState } from '@/store/types'
import multicall from '@/utils/multicall'

export type DerAddressList = { [key: string]: { token: string; derivative: string } } | null

export const derivativeList = {
  open: '',
  name: '',
  token: '',
  margin_token: ''
}

/**
 {
    "MATICUSD": "0x0000000000000000000000000000000000000000",
    "0x1c4D328CFC04ca709Ba584466139262770C3cB1E": "0x0000000000000000000000000000000000000000",
    "CAKEUSD": "0x0000000000000000000000000000000000000000",
    "0x7aBcA3B5f0Ca1da0eC05631d5788907D030D0a22": "0x0000000000000000000000000000000000000000",
    "BNBUSD": "0x46e0BBa3a5dbB0A062AeC20de78D0E901D9BD428",
    "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd": "0x46e0BBa3a5dbB0A062AeC20de78D0E901D9BD428"
}
 */
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

const useDerivativeListStore = create<DerivativeListState>((set) => ({
  derivativeList: [],
  derAddressList: null,
  derivativeListLoaded: false,
  getDerivativeList: async (marginTokenAddress: string) => {
    const { data } = await getDerivativeList(marginTokenAddress)
    if (data) {
      console.info(`保证金${marginTokenAddress}交易对列表:`)
      console.info(data?.records)

      set({
        derivativeList: data?.records,
        derivativeListLoaded: true
      })
    }
  },
  getDerAddressList: async (address: string, list: (typeof derivativeList)[]) => {
    const derAddressList = await getDerAddressList(address, list)

    console.info(`保证金${address}交易对地址列表:`)
    console.info(derAddressList)

    set({
      derAddressList
    })
  }
}))

export { useDerivativeListStore }
