import { BigNumber } from 'ethers'
import { create } from 'zustand'

import erc20Abi from '@/config/abi/erc20.json'
import tokens from '@/config/tokens'
import { BalancesState } from '@/store/types'
import { marginTokenList } from '@/store/useMarginTokenList'
import { Rec } from '@/typings'
import { getBep20Contract, getJsonRpcProvider } from '@/utils/contractHelpers'
import multicall from '@/utils/multicall'
import { formatUnits } from '@/utils/tools'

const jsonRpc = getJsonRpcProvider()

export const getTokenBalance = async (account: string, address: string) => {
  const c = getBep20Contract(address)
  const res = await c.balanceOf(account)
  return formatUnits(res, 18)
}

export const getTokenBalances = async (account: string, list: (typeof marginTokenList)[]) => {
  let output = Object.create(null)
  const _tokens = [tokens.edrf, ...list]
  const calls = _tokens.map((t: Rec) => ({
    name: 'balanceOf',
    params: [account],
    address: t.margin_token || t.tokenAddress
  }))

  const res = await multicall(erc20Abi, calls)
  const bnb = await jsonRpc.getBalance(account)

  const bnbBalance = formatUnits(bnb, 18)

  if (res.length > 0) {
    res.forEach((t: BigNumber[], index: number) => {
      const balance = formatUnits(t[0], 18)
      output = {
        ...output,
        [_tokens[index].symbol]: balance,
        [_tokens[index].symbol.toLowerCase()]: balance
      }
    })
  }

  return { ...output, bnb: bnbBalance, BNB: bnbBalance }
}

const useBalancesStore = create<BalancesState>((set) => ({
  balances: null,
  loaded: false,
  getTokenBalances: async (account: string, list: (typeof marginTokenList)[]) => {
    const data = await getTokenBalances(account, list)
    // console.info(`getTokenBalances:`)
    // console.info(data)
    set({ balances: data, loaded: true })
  },
  reset: () => set(() => ({ balances: null }))
}))

export { useBalancesStore }
