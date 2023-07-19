import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { isEmpty } from 'lodash'

import DerifyExchangeAbi from '@/config/abi/DerifyExchange.json'
import { multicallV2 } from '@/utils/multicall'
import { formatUnits } from '@/utils/tools'

type UserAccount = string | undefined

interface TraderVariablesAtomParams {
  exchange: string | undefined
  userAccount: UserAccount
}

const init = {
  loaded: false,
  data: {
    balance: '0',
    marginRate: '0',
    totalMargin: '0',
    marginBalance: '0',
    availableMargin: '0',
    totalPositionAmount: '0'
  }
}

export const traderVariablesAtom = atom<typeof init>(init)

const getTraderVariables = async (trader: string, exchange: string): Promise<typeof init.data> => {
  const calls = [
    {
      name: 'getTraderAccount',
      address: exchange,
      params: [trader]
    },
    {
      name: 'getTraderVariables',
      address: exchange,
      params: [trader]
    }
  ]

  try {
    const response = await multicallV2(DerifyExchangeAbi, calls)

    if (!isEmpty(response)) {
      const [getTraderAccount, getTraderVariables] = response
      const {
        balance,
        totalMargin,
        availableMargin = 0
      } = getTraderAccount ?? {
        balance: 0,
        totalMargin: 0,
        availableMargin: 0
      }
      const { marginRate, marginBalance, totalPositionAmount } = getTraderVariables ?? {
        marginRate: 0,
        marginBalance: 0,
        totalPositionAmount: 0
      }

      return {
        balance: formatUnits(balance, 8),
        marginRate: formatUnits(marginRate, 8),
        totalMargin: formatUnits(totalMargin, 8),
        marginBalance: formatUnits(marginBalance, 8),
        availableMargin: formatUnits(availableMargin, 8),
        totalPositionAmount: formatUnits(totalPositionAmount, 8)
      }
    }

    return init.data
  } catch (e) {
    console.info(e)
    return init.data
  }
}

export const asyncTraderVariablesAtom = atomFamily((params: TraderVariablesAtomParams) =>
  atom(init, async (get, set) => {
    const { userAccount, exchange } = params
    try {
      if (userAccount && exchange) {
        const data = await getTraderVariables(userAccount, exchange)
        set(traderVariablesAtom, { loaded: true, data })
      }
    } catch (e) {
      set(traderVariablesAtom, init)
    }
  })
)
