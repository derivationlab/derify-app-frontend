import { sortBy } from 'lodash'
import { create } from 'zustand'

import { getMarginAddressList, getMarginTokenList as _getMarginTokenList } from '@/api'
import { ZERO } from '@/config'
import DerifyProtocolAbi from '@/config/abi/DerifyProtocol.json'
import contracts from '@/config/contracts'
import { MarginTokenListState } from '@/store/types'
import { Rec } from '@/typings'
import multicall from '@/utils/multicall'

export const getMarginTokenList = async (page = 0) => {
  const { data } = await _getMarginTokenList(page)
  return data
}

export const getMarginDeployStatus = async (marginList: (typeof marginTokenList)[]) => {
  let marginDeployStatus = Object.create(null)
  const calls = marginList.map((margin) => ({
    address: contracts.derifyProtocol.contractAddress,
    name: 'getMarginTokenContractCollections',
    params: [margin.margin_token]
  }))

  const response = await multicall(DerifyProtocolAbi, calls)

  response.forEach(([data]: string[], index: number) => {
    marginDeployStatus = {
      ...marginDeployStatus,
      [marginList[index].symbol]: data[0] === ZERO ? 0 : 1
    }
  })

  return marginDeployStatus
}

const getMarginDeployStatus1 = async (marginList: string[]) => {
  let marginDeployStatus = Object.create(null)
  const calls = marginList.map((address) => ({
    address: contracts.derifyProtocol.contractAddress,
    name: 'getMarginTokenContractCollections',
    params: [address]
  }))

  const response = await multicall(DerifyProtocolAbi, calls)

  response.forEach(([data]: string[], index: number) => {
    marginDeployStatus = {
      ...marginDeployStatus,
      [marginList[index]]: data[0] === ZERO ? 0 : 1
    }
  })

  return marginDeployStatus
}

export const marginTokenList = {
  open: 0,
  logo: '',
  name: '',
  symbol: '',
  max_pm_apy: 0,
  margin_token: ''
}

export const pagingParams = {
  totalPages: 0,
  totalItems: 0,
  currentPage: 0
}

const useMarginTokenListStore = create<MarginTokenListState>((set) => ({
  pagingParams: pagingParams,
  marginTokenList: [],
  marginAddressList: [],
  marginTokenSymbol: [],
  marginTokenListLoaded: false,
  getMarginTokenList: async () => {
    const data = await getMarginTokenList()

    if (data && data.records.length) {
      const _data = data.records
      const deployStatus = await getMarginDeployStatus(_data)

      const filter = _data.filter((f: Rec) => deployStatus[f.symbol])
      const toSort = sortBy(filter, ['max_pm_apy', 'open'], 'desc')

      set({
        pagingParams: { currentPage: data.currentPage, totalItems: data.totalItems, totalPages: data.totalPages },
        marginTokenList: toSort,
        marginTokenSymbol: toSort.map((margin) => margin.symbol),
        marginTokenListLoaded: true
      })
    }
  },
  getMarginAddressList: async () => {
    const { data } = await getMarginAddressList()

    if (data.length) {
      const deployStatus = await getMarginDeployStatus1(data)

      const filter = data.filter((address: string) => deployStatus[address])
      set({
        marginAddressList: filter
      })
    }
  }
}))

export { useMarginTokenListStore }
