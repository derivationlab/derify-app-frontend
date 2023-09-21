import { getAllMarginTokenList, getMarginTokenList as _getMarginTokenList } from 'derify-apis-test'
import { isEmpty } from 'lodash-es'
import { create } from 'zustand'

import { ZERO } from '@/config'
import DerifyProtocolAbi from '@/config/abi/DerifyProtocol.json'
import contracts from '@/config/contracts'
import { MarginTokenListState } from '@/store/types'
import { Rec } from '@/typings'
import multicall from '@/utils/multicall'

export const getMarginTokenList = async (page = 0) => {
  const { data } = await _getMarginTokenList<{ data: Rec }>(page)
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

const getMarginDeployStatusForAllMarginTokenList = async (marginList: string[]) => {
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
  marginTokenList: [],
  marginTokenListStore: [],
  marginTokenListForApply: [],
  // All margin tokens
  allMarginTokenList: [],
  marginTokenListLoaded: false,
  getMarginTokenList: async () => {
    const data = await getMarginTokenList()
    if (!isEmpty(data.records)) {
      const _data = data.records
      const deployStatus = await getMarginDeployStatus(_data)
      const marginTokenList = _data.filter((f: Rec) => deployStatus[f.symbol])
      const marginTokenListForApply = marginTokenList.filter((f: Rec) => f.advisor && f.open)
      // const marginTokenListForApply = marginTokenList.filter((f: Rec) => f.open)
      set({
        pagingParams: { currentPage: data.currentPage, totalItems: data.totalItems, totalPages: data.totalPages },
        marginTokenList,
        marginTokenListForApply,
        marginTokenListLoaded: true
      })
    }
  },
  getAllMarginTokenList: async () => {
    /**
     * Full data, no paging, used as parameters for some calculations:
     * @Market Info
     * @Buyback Plan
     */
    const { data } = await getAllMarginTokenList<{ data: string[] }>()
    if (data.length) {
      const deployStatus = await getMarginDeployStatusForAllMarginTokenList(data)
      const filterData = data.filter((address: string) => deployStatus[address])
      set({
        allMarginTokenList: filterData
      })
    }
  },
  /**
   * Throttling data, processing the margin currency that appears in the address bar
   * @user input
   * @user click
   * @param data
   */
  updateMarginTokenListStore: (data: (typeof marginTokenList)[]) => {
    set({
      marginTokenListStore: data
    })
  }
}))

export { useMarginTokenListStore }
