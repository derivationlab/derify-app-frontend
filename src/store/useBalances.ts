import { BigNumber } from 'ethers'
import { chunk, uniqBy } from 'lodash-es'
import { create } from 'zustand'

import erc20Abi from '@/config/abi/erc20.json'
import baseTokens from '@/config/tokens'
import { BalancesState } from '@/store/types'
import { marginTokenList } from '@/store/useMarginTokenList'
import { Rec } from '@/typings'
import { getJsonRpcProvider } from '@/utils/contractHelpers'
import multicall from '@/utils/multicall'
import { formatUnits } from '@/utils/tools'

export type TMarginTokenList = (typeof marginTokenList)[]

const jsonRpc = getJsonRpcProvider()

const uniqByTokens = (list: Rec[]) => {
  return uniqBy([...Object.values(baseTokens), ...list], 'symbol')
}

const handleCalls = (tokens: Rec[], account: string) => {
  return [
    ...tokens.map((t: Rec) => ({
      name: 'balanceOf',
      params: [account],
      address: t.margin_token || t.tokenAddress
    })),
    ...tokens.map((t: Rec) => ({
      name: 'decimals',
      address: t.margin_token || t.tokenAddress
    }))
  ]
}

export const getTokenBalances = async (account: string, list: Rec[]) => {
  let output = Object.create(null)
  const tokens = uniqByTokens(list)
  const calls = handleCalls(tokens, account)

  const res = await multicall(erc20Abi, calls)
  const bnb = await jsonRpc.getBalance(account)

  const bnbBalance = formatUnits(bnb, 18)

  if (res.length > 0) {
    const [balances, decimals] = chunk(res, tokens.length)
    balances.forEach((balanceArr, index: number) => {
      const [decimal] = (decimals as number[][])[index]
      const [balance] = balanceArr as BigNumber[]
      const _balance = formatUnits(balance, decimal)
      output = {
        ...output,
        [calls[index].address]: _balance,
        [tokens[index].symbol]: _balance,
        [tokens[index].symbol.toLowerCase()]: _balance
      }
    })
  }

  return { ...output, bnb: bnbBalance, BNB: bnbBalance }
}

const useBalancesStore = create<BalancesState>((set) => ({
  balances: null,
  loaded: false,
  getTokenBalances: async (account: string, list: TMarginTokenList) => {
    if (!account || list.length === 0) {
      set({ balances: null, loaded: true })
      return
    }
    const data = await getTokenBalances(account, list)
    set({ balances: data, loaded: true })
  }
}))

export { useBalancesStore }
