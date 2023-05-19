import { create } from 'zustand'

import { initialTraderVariables, InitialTraderVariablesType } from '@/hooks/helper'
import { Rec, TraderInfoState } from '@/store/types'

const useTraderInfoStore = create<TraderInfoState>((set) => ({
  variables: initialTraderVariables,
  rewardsInfo: {},
  stakingInfo: {},
  variablesLoaded: false,
  updateVariables: (data: InitialTraderVariablesType) =>
    set(() => {
      // console.info(`updateVariables:`)
      // console.info(data)
      return { variables: data, variablesLoaded: true }
    }),
  updateStakingInfo: (data: Rec) =>
    set(() => {
      // console.info(`updateStakingInfo:`)
      // console.info(data)
      return { stakingInfo: data }
    }),
  updateRewardsInfo: (data: Rec) =>
    set(() => {
      // console.info(`updateRewardsInfo:`)
      // console.info(data)
      return { rewardsInfo: data }
    }),
  reset: () => {
    set({ variables: initialTraderVariables, variablesLoaded: false })
  }
}))

export { useTraderInfoStore }
