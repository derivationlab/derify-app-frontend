import { create } from 'zustand'

import { Rec, TraderEarningState } from '@/store/types'

const useTraderEarningStore = create<TraderEarningState>((set) => ({
  rewardsInfo: {},
  stakingInfo: {},
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

export { useTraderEarningStore }
