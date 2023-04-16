import { create } from 'zustand'

import { PoolsInfoState } from '@/store/types'

const usePoolsInfoStore = create<PoolsInfoState>((set) => ({
  drfPoolBalance: '0',
  bondPoolBalance: '0',
  updateDrfPoolBalance: (data: string) =>
    set(() => {
      // console.info(`updateDrfPoolBalance:`)
      // console.info(data)
      return { drfPoolBalance: data }
    }),
  updateBondPoolBalance: (data: string) =>
    set(() => {
      // console.info(`updateBondPoolBalance:`)
      // console.info(data)
      return { bondPoolBalance: data }
    })
}))

export { usePoolsInfoStore }
