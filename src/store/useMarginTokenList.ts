import { isEmpty } from 'lodash'
import { create } from 'zustand'

import { getAllMarginTokenList, getMarginTokenList as _getMarginTokenList } from '@/api'
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
  margin_token: '',
  amount_decimals: 2
}

export const pagingParams = {
  totalPages: 0,
  totalItems: 0,
  currentPage: 0
}

const useMarginTokenListStore = create<MarginTokenListState>((set) => ({
  // Margin pagination parameter support
  pagingParams: pagingParams,
  // Margin pagination
  marginTokenList: [],
  // All margin tokens
  allMarginTokenList: [],
  marginTokenSymbol: [],
  marginTokenListLoaded: false,
  getMarginTokenList: async () => {
    const data = await getMarginTokenList()
    if (!isEmpty(data.records)) {
      const _data = data.records
      const deployStatus = await getMarginDeployStatus(_data)
      const filterData = _data.filter((f: Rec) => deployStatus[f.symbol])
      set({
        pagingParams: { currentPage: data.currentPage, totalItems: data.totalItems, totalPages: data.totalPages },
        marginTokenList: filterData,
        marginTokenSymbol: filterData.map((margin: Rec) => margin.symbol),
        marginTokenListLoaded: true
      })
    }
  },
  getAllMarginTokenList: async () => {
    const { data } = await getAllMarginTokenList()
    if (data.length) {
      const deployStatus = await getMarginDeployStatus1(data)
      const filterData = data.filter((address: string) => deployStatus[address])
      set({
        allMarginTokenList: filterData
      })
    }
  }
}))

export { useMarginTokenListStore }
