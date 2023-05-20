import { create } from 'zustand'

import { Rec, TraderInfoState } from '@/store/types'

const useTraderInfoStore = create<TraderInfoState>((set) => ({
  rewardsInfo: {},
  stakingInfo: {},
  variablesLoaded: false,
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
    })
}))

export { useTraderInfoStore }
