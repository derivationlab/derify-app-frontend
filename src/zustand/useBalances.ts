import create from 'zustand'

import multicall from '@/utils/multicall'
import { baseProvider } from '@/utils/baseProvider'
import { BalancesState } from '@/zustand/types'
import { getBep20Contract } from '@/utils/contractHelpers'
import tokens, { MARGIN_TOKENS } from '@/config/tokens'
import { safeInterceptionValues } from '@/utils/tools'

import erc20Abi from '@/config/abi/erc20.json'

const TOKENS = [tokens.edrf, ...MARGIN_TOKENS]
const initial = (): Record<string, string> => {
  let value = Object.create(null)

  TOKENS.forEach((t) => {
    value = {
      ...value,
      [t.symbol]: '0',
      [t.symbol.toLowerCase()]: '0'
    }
  })

  return value
}

export const getTokenBalance = async (account: string, address: string) => {
  const c = getBep20Contract(address)

  const res = await c.balanceOf(account)

  return safeInterceptionValues(res, 18, 18)
}

export const getTokenBalances = async (account: string) => {
  let initialVal = initial()

  const calls = TOKENS.map((t) => ({ address: t.tokenAddress, name: 'balanceOf', params: [account] }))

  const res = await multicall(erc20Abi, calls)
  const bnb = await baseProvider.getBalance(account)

  const bnbBalance = safeInterceptionValues(bnb, 18, 18)

  if (res.length > 0) {
    res.forEach((t: any, index: number) => {
      const precision = TOKENS[index].precision
      const balance = safeInterceptionValues(String(t), precision, precision)
      initialVal = {
        ...initialVal,
        [TOKENS[index].symbol]: balance,
        [TOKENS[index].symbol.toLowerCase()]: balance
      }
    })
  }

  return { ...initialVal, BNB: bnbBalance }
}

const useTokenBalances = create<BalancesState>((set) => ({
  balances: initial(),
  loaded: false,
  fetch: async (account: string) => {
    const data = await getTokenBalances(account)
    // console.info(`getTokenBalances:`)
    // console.info(data)
    set({ balances: data, loaded: true })
  },
  reset: () => set(() => ({ balances: initial() }))
}))

export { useTokenBalances }
