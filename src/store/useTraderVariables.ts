import { isEmpty } from 'lodash'
import { create } from 'zustand'

import DerifyExchangeAbi from '@/config/abi/DerifyExchange.json'
import { TraderVariablesState } from '@/store/types'
import multicall, { multicallV2 } from '@/utils/multicall'
import { formatUnits } from '@/utils/tools'

const initialTraderVariables = {
  balance: '0',
  marginRate: '0',
  totalMargin: '0',
  marginBalance: '0',
  availableMargin: '0',
  totalPositionAmount: '0'
}

export type InitialTraderVariablesType = typeof initialTraderVariables

const getTraderVariables = async (trader: string, exchange: string): Promise<InitialTraderVariablesType> => {
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

    return initialTraderVariables
  } catch (e) {
    console.info(e)
    return initialTraderVariables
  }
}

const useTraderVariablesStore = create<TraderVariablesState>((set) => ({
  variables: initialTraderVariables,
  variablesLoaded: false,
  getTraderVariables: async (address: string, exchange: string) => {
    const data = await getTraderVariables(address, exchange)

    set(() => {
      return { variables: data, variablesLoaded: true }
    })
  },
  reset: () => {
    set({ variables: initialTraderVariables, variablesLoaded: false })
  }
}))

export { useTraderVariablesStore }
